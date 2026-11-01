const { createClient } = require("@supabase/supabase-js");
const { supabase, supabaseUrl, supabaseKey, isConfigured } = require("../config/supabase");

function allowDemoAuth() {
  return String(process.env.ALLOW_DEMO_AUTH || "false").toLowerCase() === "true";
}

function mapUser(supabaseUser, fallbackName = "") {
  const meta = supabaseUser?.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: meta.name || meta.full_name || fallbackName || supabaseUser.email?.split("@")[0] || "Traveller",
  };
}

function clientWithToken(token) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const displayName = name?.trim() || cleanEmail.split("@")[0];

    if (!isConfigured) {
      if (!allowDemoAuth()) {
        return res.status(503).json({
          message:
            "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to backend/.env (see docs/SUPABASE_AND_GEMINI_SETUP.md).",
        });
      }
      const mockUser = { id: `usr_${Date.now()}`, email: cleanEmail, name: displayName };
      return res.status(201).json({
        message: "Registered in demo mode (Supabase not configured)",
        token: `atp_session_${Date.now()}`,
        user: mockUser,
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: String(password),
      options: {
        data: { name: displayName },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message || "Signup failed" });
    }

    if (!data?.user) {
      return res.status(400).json({ message: "Signup failed — no user returned" });
    }

    // If email confirmation is ON, session may be null — tell the user clearly
    const token = data.session?.access_token;
    if (!token) {
      return res.status(201).json({
        message:
          "Account created. Confirm your email (or disable Confirm email in Supabase Auth settings), then log in.",
        token: null,
        user: mapUser(data.user, displayName),
        needsEmailConfirmation: true,
      });
    }

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: mapUser(data.user, displayName),
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (!isConfigured) {
      if (!allowDemoAuth()) {
        return res.status(503).json({
          message:
            "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to backend/.env.",
        });
      }
      const mockUser = {
        id: `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`,
        email: cleanEmail,
        name: cleanEmail.split("@")[0] || "Traveller",
      };
      return res.json({
        message: "Login successful (demo mode)",
        token: `atp_session_${Date.now()}`,
        user: mockUser,
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password),
    });

    if (error || !data?.user) {
      return res.status(401).json({
        message: error?.message || "Invalid email or password",
      });
    }

    const token = data.session?.access_token;
    if (!token) {
      return res.status(401).json({
        message: "Login succeeded but no session token. Check Supabase Auth email confirmation settings.",
      });
    }

    return res.json({
      message: "Login successful",
      token,
      user: mapUser(data.user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
}

async function logout(req, res) {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.slice(7);
      try {
        const authed = clientWithToken(token);
        await authed.auth.signOut();
      } catch (_) {
        // ignore
      }
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(204).send();
  }
}

async function profile(req, res) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.slice(7);
    if (token.startsWith("atp_")) {
      return res.status(401).json({ message: "Demo token — please sign in with Supabase" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    return res.json({ user: mapUser(data.user) });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
}

module.exports = {
  signup,
  login,
  logout,
  profile,
};

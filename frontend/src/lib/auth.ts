import { useEffect, useState } from "react";
import { setToken } from "@/services/api";

export interface AppUser {
  name: string;
  email: string;
}

const USER_KEY = "atp_user";

export function getStoredUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AppUser) : null;
}

export function saveSession(user: AppUser, token?: string) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) setToken(token);
  window.dispatchEvent(new Event("atp-auth"));
}

export function clearSession() {
  window.localStorage.removeItem(USER_KEY);
  setToken(null);
  window.dispatchEvent(new Event("atp-auth"));
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    window.addEventListener("atp-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("atp-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, signOut: clearSession };
}
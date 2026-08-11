import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="dash">
      <header className="dash-header">
        <p className="dash-brand">AI Travel Planner</p>
        <div className="dash-user">
          <span>Hi, {user?.name || "Traveler"}</span>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="dash-body">
        <aside className="dash-left">
          <h2>Reviews & tips</h2>
          <p>Trip reviews, weather, ratings, must-try spots, and safety tips will live here.</p>
          <ul>
            <li>Delhi · 36°C</li>
            <li>Goa</li>
            <li>Jaipur</li>
            <li>Udaipur</li>
          </ul>
        </aside>

        <div className="dash-right">
          <h2>Plan a trip</h2>
          <p>Search Indian regions and get AI recommendations based on weather.</p>
          <label>
            Region
            <select defaultValue="delhi">
              <option value="delhi">Delhi</option>
              <option value="goa">Goa</option>
              <option value="jaipur">Jaipur</option>
              <option value="udaipur">Udaipur</option>
            </select>
          </label>
          <button type="button" className="recommend-btn" disabled>
            Recommended (coming soon)
          </button>
        </div>
      </section>
    </div>
  );
}

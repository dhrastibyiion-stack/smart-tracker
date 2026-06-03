import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/auth";
import { useTheme } from "../theme/ThemeContext";

import "../TaskLayout.css";

const Header = () => {
   const navigate = useNavigate();
   const { theme, toggleTheme } = useTheme();
   const { user, role } = useAuth();

  const handleSignout = () => {
    navigate("/logout", { replace: true });
  };

  const isAdmin = role === "admin";
  const isManager = role === "projectManager";
  const isLoggedIn = !!user;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-badge">S</div>
          <div className="brand-title">
            <strong>Smarter Tasks</strong>
            <span>Graduation Final Year Project</span>
          </div>
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                Home
              </NavLink>
              {(isAdmin || isManager) && (
                <>
                  <NavLink
                    to="/playground"
                    className={({ isActive }) =>
                      isActive ? "nav-link nav-link-active" : "nav-link"
                    }
                  >
                    Posts
                  </NavLink>
                </>
              )}
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                Tasks
              </NavLink>
              {isAdmin && (
                <>
                  <NavLink
                    to="/account/projects"
                    className={({ isActive }) =>
                      isActive ? "nav-link nav-link-active" : "nav-link"
                    }
                  >
                    Projects
                  </NavLink>
                  <NavLink
                    to="/account/members"
                    className={({ isActive }) =>
                      isActive ? "nav-link nav-link-active" : "nav-link"
                    }
                  >
                    Members
                  </NavLink>
                </>
              )}
              <button
                type="button"
                className="nav-link nav-link-button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === "dark" ? "Dark" : "Light"}
              </button>

              <span className="pill">
                {user?.name || user?.username || "User"}
              </span>

              <button
                type="button"
                className="nav-link nav-link-button"
                onClick={handleSignout}
              >
                Signout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/signin"
                className="nav-link"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="nav-link"
              >
                Sign Up
              </NavLink>
              <button
                type="button"
                className="nav-link nav-link-button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === "dark" ? "Dark" : "Light"}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/auth";
import { useTheme } from "../theme/ThemeContext";

import "../TaskLayout.css";

 interface HeaderProps {
  showSignUp?: boolean;
}

const Header = ({ showSignUp = true }: HeaderProps) => {
   const navigate = useNavigate();
   const { theme, toggleTheme } = useTheme();
   const { user, role } = useAuth();

  const handleSignout = () => {
    navigate("/logout", { replace: true });
  };

  const isLoggedIn = !!user;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-badge">S</div>
          <div className="brand-title">
            <strong className="brand-name">Smarter Tasks</strong>
            <span className="brand-subtitle">Graduation Final Year Project</span>
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
              {showSignUp && (
                <NavLink
                  to="/signup"
                  className="nav-link"
                >
                  Sign Up
                </NavLink>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

import Header from "../components/Header";

import "../home-hero.css";

const roleToRoute: Record<string, string> = {
  admin: "/admin-dashboard",
  projectManager: "/pm-dashboard",
  dev: "/dev-dashboard",
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  useEffect(() => {
    if (user && role) {
      const dashboardRoute = roleToRoute[role] || "/dev-dashboard";
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, role, navigate]);

  return (
    <div className="home-light">
      <Header showSignUp={false} />

      {/* HERO */}
      <div className="home-hero-wrap">
        <div className="home-hero">
          <div className="home-hero-text">
            <div className="home-hero-badge">
              <span className="home-hero-badge-dot" />
              Graduation Final Year Project
            </div>

            <h1 className="home-hero-title">Smarter Tasks</h1>
            <p className="home-hero-subtitle">
              Manage pending & completed tasks in one place—with role-based
              dashboards for Admin, Project Manager, and Developer.
            </p>

            <div className="home-hero-actions">
              <button
                type="button"
                className="home-btn home-btn-primary"
                onClick={() => navigate("/signin")}
              >
                Get started
                <span aria-hidden>→</span>
              </button>
            </div>

            <div className="home-hero-stats">
              <div className="home-stat">
                <strong>Tasks</strong>
                <span>Pending & completed tracking</span>
              </div>
              <div className="home-stat">
                <strong>Projects</strong>
                <span>Progress by role</span>
              </div>
              <div className="home-stat">
                <strong>Collab</strong>
                <span>Communication & oversight</span>
              </div>
            </div>
          </div>

          <div className="home-feature-grid">
            <div className="home-feature">
              <h3>One dashboard for everything</h3>
              <p>Pending & completed tasks with a clean, consistent UI.</p>
            </div>
            <div className="home-feature">
              <h3>Role-based views</h3>
              <p>Admin, Project Manager, and Developer dashboards tailored to you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
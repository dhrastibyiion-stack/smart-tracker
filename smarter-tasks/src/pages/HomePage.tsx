import React from "react";
import Header from "../components/Header";

const HomePage: React.FC = () => {
  return (
    <div className="home-light">
      <Header />

      <div className="home-page">
        {/* Hero Section */}
        <div className="home-hero">
          <h1>Smarter Tasks</h1>
          <p>
            Manage your pending and completed tasks in one place. Also includes
            a React data-fetching playground.
          </p>
        </div>

        <section>
          <div className="home-content">
            <div className="home-left">
              <h2>Smarter Task is used for:</h2>
              <ul className="feature-list">
                <li>Managing pending and completed tasks</li>
                <li>Tracking project progress</li>
                <li>Team collaboration and communication</li>
                <li>React data-fetching playground</li>
                <li>Admin dashboard for oversight</li>
                <li>Project manager dashboard</li>
                <li>Developer dashboard</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2>About Smarter Tasks</h2>
          <p>
            Smarter Tasks is a comprehensive task management application designed
            to help teams stay organized and productive. With intuitive interfaces
            for different roles, everyone can focus on what matters most.
          </p>
          <p>
            After logging in, users gain access to specialized dashboards based on
            their role: Admin, Project Manager, or Developer, each providing
            tailored views and controls.
          </p>
        </section>
      </div>
    </div>
  );
};

export default HomePage;














import React from "react";
import { Link, useNavigate } from "react-router-dom";


type StoredUser = { name?: string; username?: string };

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const nameAndEmail = (() => {
    try {
      const raw = window.localStorage.getItem("user");
      const parsed = raw ? (JSON.parse(raw) as StoredUser) : null;
      return {
        name: parsed?.name ?? "",
        emailId: parsed?.username ?? "",
      };
    } catch {
      return { name: "", emailId: "" };
    }
  })();

  const { name, emailId } = nameAndEmail;

  const handleLogout = () => {
    navigate("/logout", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Dashboard</h1>

      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-gray-700">
          <p className="mb-2">
            <span className="font-semibold">Name:</span> {name}
          </p>
          <p>
            <span className="font-semibold">Email ID:</span> {emailId}
          </p>
        </div>


        <div className="mt-6">
          <Link
            id="logout-link"
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="text-blue-700 font-semibold hover:underline"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



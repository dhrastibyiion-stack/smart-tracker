import React from "react";
import { useNavigate } from "react-router-dom";

const Notfound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-3">404</h1>
        <p className="text-lg mb-6">Not Found</p>

        <button
          id="backToHomeButton"
          onClick={() => navigate("/home", { replace: true })}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline-gray"
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
};

export default Notfound;


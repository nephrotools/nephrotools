import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/"); // Navigate to the homepage
    };

    return (
        <div className="container mt-5 text-center">
            <h1>404 - Page Not Found</h1>
            <p>The URL you requested does not exist.</p>
            <button className="btn btn-primary" onClick={handleGoHome}>
                Go Back to Home
            </button>
        </div>
    );
};

export default NotFoundPage;

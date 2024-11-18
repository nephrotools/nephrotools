import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div className="container my-2">

            <div className="list-group mt-4">
                <p className="list-group-item active mb-0">CRRT</p>
                <Link to="/crrt-fluid-planning" className="list-group-item list-group-item-action">
                    CRRT Fluid Planning
                </Link>
                <Link to="/crrt-hyponatremia" className="list-group-item list-group-item-action">
                    CRRT Hyponatremia
                </Link>
            </div>

            <div className="list-group mt-4">
                <p className="list-group-item active mb-0 bg-success">Sodium</p>
                <Link to="/electrolyte-free-water" className="list-group-item list-group-item-action">
                    Electrolyte Free Water Clearance
                </Link>
            </div>
        </div>
    );
};

export default HomePage;

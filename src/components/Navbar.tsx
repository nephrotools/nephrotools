import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    NephroTools
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                id="crrtDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                CRRT
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="crrtDropdown">
                                <li>
                                    <Link to="/crrt-fluid-planning" className="dropdown-item">
                                        CRRT Fluid Planning
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/crrt-hyponatremia" className="dropdown-item">
                                        CRRT Hyponatremia
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                id="sodiumDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                HD
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="sodiumDropdown">
                                <li>
                                    <Link to="/hd-hyponatremia" className="dropdown-item">
                                        HD Hyponatremia
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                id="sodiumDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Sodium
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="sodiumDropdown">
                                <li>
                                    <Link to="/electrolyte-free-water" className="dropdown-item">
                                        Electrolyte Free Water Clearance
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

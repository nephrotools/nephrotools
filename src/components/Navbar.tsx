import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Collapse from "bootstrap/js/dist/collapse";

const Navbar: React.FC = () => {
    const collapseRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const el = collapseRef.current;
        if (!el) return;

        const handleShown = () => setIsMenuOpen(true);
        const handleHidden = () => setIsMenuOpen(false);

        el.addEventListener("shown.bs.collapse", handleShown);
        el.addEventListener("hidden.bs.collapse", handleHidden);

        return () => {
            el.removeEventListener("shown.bs.collapse", handleShown);
            el.removeEventListener("hidden.bs.collapse", handleHidden);
        };
    }, []);

    /**
     * Close the navbar ONLY when it's in "mobile collapsed" mode.
     * Bootstrap md breakpoint is 768px (navbar-expand-md).
     */
    const closeMobileMenu = useCallback(() => {
        // Only close on mobile where the hamburger is used
        if (window.innerWidth >= 768) return;

        const el = collapseRef.current;
        if (!el) return;

        // Only hide if it's currently shown (optional guard)
        if (!el.classList.contains("show")) return;

        const instance =
            Collapse.getInstance(el) ?? new Collapse(el, { toggle: false });

        instance.hide();
    }, []);

    const toggleMobileMenu = useCallback(() => {
        const el = collapseRef.current;
        if (!el) return;

        const instance =
            Collapse.getInstance(el) ?? new Collapse(el, { toggle: false });

        instance.toggle();
    }, []);

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
            <div className="container">
                <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
                    NephroTools
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMobileMenu}
                    aria-controls="navbarNav"
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="navbarNav" ref={collapseRef}>
                    <ul className="navbar-nav">
                        {/* CRRT */}
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                id="crrtDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                onClick={(e) => e.preventDefault()} // prevents jumping to top due to "#"
                            >
                                CRRT
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="crrtDropdown">
                                <li>
                                    <Link
                                        to="/crrt-fluid-planning"
                                        className="dropdown-item"
                                        onClick={closeMobileMenu}
                                    >
                                        CRRT Fluid Planning
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/crrt-hyponatremia"
                                        className="dropdown-item"
                                        onClick={closeMobileMenu}
                                    >
                                        CRRT Hyponatremia
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* HD */}
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                id="hdDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                onClick={(e) => e.preventDefault()}
                            >
                                HD
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="hdDropdown">
                                <li>
                                    <Link
                                        to="/hd-sodiumchange"
                                        className="dropdown-item"
                                        onClick={closeMobileMenu}
                                    >
                                        HD Expected ΔNa
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* Sodium */}
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                id="sodiumDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                onClick={(e) => e.preventDefault()}
                            >
                                Sodium
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="sodiumDropdown">
                                <li>
                                    <Link
                                        to="/sodium-change-calculator"
                                        className="dropdown-item"
                                        onClick={closeMobileMenu}
                                    >
                                        Sodium Change Calculator
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/electrolyte-free-water"
                                        className="dropdown-item"
                                        onClick={closeMobileMenu}
                                    >
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

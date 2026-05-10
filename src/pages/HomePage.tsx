import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Config } from '../AppConfig';

const HomePage: React.FC = () => {
    return (
        <div className="container home-page my-2">
            <Helmet>
                <title>{Config.Title}</title>
            </Helmet>

            <h1 className="home-title">NephroTools</h1>

            <div className="home-grid">
                <section className="tool-group" aria-labelledby="crrt-tools">
                    <div className="tool-group-header">
                        <h2 id="crrt-tools">CRRT</h2>
                    </div>
                    <div className="list-group list-group-flush">
                        <Link to="/crrt-fluid-planning" className="list-group-item list-group-item-action">
                            CRRT Fluid Planning
                        </Link>
                        <Link to="/crrt-hyponatremia" className="list-group-item list-group-item-action">
                            CRRT Hyponatremia
                        </Link>
                    </div>
                </section>

                <section className="tool-group" aria-labelledby="hd-tools">
                    <div className="tool-group-header">
                        <h2 id="hd-tools">HD</h2>
                    </div>
                    <div className="list-group list-group-flush">
                        <Link to="/hd-sodiumchange" className="list-group-item list-group-item-action">
                            HD Expected &Delta;Na
                        </Link>
                    </div>
                </section>

                <section className="tool-group" aria-labelledby="sodium-tools">
                    <div className="tool-group-header">
                        <h2 id="sodium-tools">Sodium</h2>
                    </div>
                    <div className="list-group list-group-flush">
                        <Link to="/sodium-change-calculator" className="list-group-item list-group-item-action">
                            Sodium Change Calculator
                        </Link>
                        <Link to="/electrolyte-free-water" className="list-group-item list-group-item-action">
                            Electrolyte Free Water Clearance
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;

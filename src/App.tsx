import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CRRTFluidPlanning from "./pages/CRRTFluidPlanning";
import CRRTHyponatremia from "./pages/CRRTHyponatremia";
import ElectrolyteFreeWater from "./pages/ElectrolyteFreeWater";
import HDHyponatremia from "./pages/HDHyponatremia";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotFoundPage from "./pages/NotFoundPage"; // Import the NotFoundPage component
import { useEffect } from "react";
import ReactGA from 'react-ga4';
import { Config } from "./AppConfig";

const App = () => {

    useEffect(() => {
        // Initialize Google Analytics with Measurement ID
        ReactGA.initialize(Config.GoogleAnalytics);
    }, []);

    return (
        <HashRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/crrt-fluid-planning" element={<CRRTFluidPlanning />} />
                <Route path="/crrt-hyponatremia" element={<CRRTHyponatremia />} />
                <Route path="/hd-hyponatremia" element={<HDHyponatremia />} />
                <Route path="/electrolyte-free-water" element={<ElectrolyteFreeWater />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Footer />
        </HashRouter>
    );
};

export default App;

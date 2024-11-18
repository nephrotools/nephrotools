import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CRRTFluidPlanning from "./pages/CRRTFluidPlanning";
import CRRTHyponatremia from "./pages/CRRTHyponatremia";
import ElectrolyteFreeWater from "./pages/ElectrolyteFreeWater";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotFoundPage from "./pages/NotFoundPage"; // Import the NotFoundPage component

// Define the routes for the app
const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <>
                <Navbar />
                <HomePage />
                <Footer />
            </>
        ),
    },
    {
        path: "/crrt-fluid-planning",
        element: (
            <>
                <Navbar />
                <CRRTFluidPlanning />
                <Footer />
            </>
        ),
    },
    {
        path: "/crrt-hyponatremia",
        element: (
            <>
                <Navbar />
                <CRRTHyponatremia />
                <Footer />
            </>
        ),
    },
    {
        path: "/electrolyte-free-water",
        element: (
            <>
                <Navbar />
                <ElectrolyteFreeWater />
                <Footer />
            </>
        ),
    },
    {
        path: "*", // Catch-all route
        element: (
            <>
                <Navbar />
                <NotFoundPage />
                <Footer />
            </>
        ), // Display the NotFoundPage for invalid URLs
    },
]);

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;

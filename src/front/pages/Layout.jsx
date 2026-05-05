import { Outlet, useLocation } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import Navbar from "./LandingPage/Navbar";
import { Footer } from "../components/Footer"

const EMPLOYEE_PATHS = [
    "/employee-dashboard",
    "/my-work-records",
    "/my-payroll",
    "/my-schedules",
    "/report-request",
    "/wellness-survey",
    "/survey",
];

const COMPANY_PATHS = [
    "/company-dashboard",
    "/manage-employees",
    "/manage-approvals",
    "/payroll-hub",
    "/schedule-planner",
    "/work-logs",
    "/survey-builder",
    "/AIRecommendationsHub",
    "/create-employee",
    "/employee-details",
    "/edit-employee",
];

const SHARED_PATHS = ["/chat"];

export const Layout = () => {
    const { pathname } = useLocation();
    const hideChrome =
        EMPLOYEE_PATHS.some(p => pathname.startsWith(p)) ||
        COMPANY_PATHS.some(p => pathname.startsWith(p))  ||
        SHARED_PATHS.some(p => pathname.startsWith(p));

    return (
        <ScrollToTop>
            {!hideChrome && <Navbar />}
            <Outlet />
            {!hideChrome && <Footer />}
        </ScrollToTop>
    );
};
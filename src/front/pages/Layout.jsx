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
    "/chat",
];

export const Layout = () => {
    const { pathname } = useLocation();
    const isEmployeeRoute = EMPLOYEE_PATHS.some(p => pathname.startsWith(p));

    return (
        <ScrollToTop>
            {!isEmployeeRoute && <Navbar />}
            <Outlet />
            {!isEmployeeRoute && <Footer />}
        </ScrollToTop>
    );
};
import { Outlet, useLocation } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import LandingNavbar from "./LandingPage/Navbar";
import Footer from "./LandingPage/Footer";
import { Navbar as DashboardNavbar } from "../components/Navbar";

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
    "/company-chat",
];

const ADMIN_PATHS = [
    "/admin-dashboard",
    "/manage-companies",
    "/audit-logs",
];

const isAdminPath = (pathname) =>
    ADMIN_PATHS.some(p => pathname.startsWith(p));

const isEmployeeOrCompanyPath = (pathname) =>
    EMPLOYEE_PATHS.some(p => pathname.startsWith(p)) ||
    COMPANY_PATHS.some(p => pathname.startsWith(p));

export const Layout = () => {
    const { pathname } = useLocation();
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const isAdmin = isAdminPath(pathname);
    const hasOwnLayout = isEmployeeOrCompanyPath(pathname);
    const showLandingChrome = !isAuthPage && !isAdmin && !hasOwnLayout;

    return (
        <ScrollToTop>
            {showLandingChrome && <LandingNavbar />}
            {isAdmin && <DashboardNavbar />}
            <Outlet />
            {showLandingChrome && <Footer />}
        </ScrollToTop>
    );
};

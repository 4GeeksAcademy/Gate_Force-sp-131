import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Login from "./pages/Login";
import EmployeeLayout from "./pages/EmployeeLayout";
import CompanyLayout from "./pages/CompanyLayout";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuditLog from "./pages/AuditLog";
import MyWorkRecords from "./pages/MyWorkRecords";
import CompanySignup from "./pages/CompanySignup";
import CreateEmployee from "./pages/CreateEmployee";
import ManageEmployees from "./pages/ManageEmployees";
import EmployeeDetails from "./pages/EmployeeDetails";
import EditEmployee from "./pages/EditEmployee";
import MySchedules from "./pages/MySchedules";
import WellnessSurvey from "./pages/WellnessSurvey";
import PrivateRoute from "./components/PrivateRoute";
import MyPayroll from "./components/MyPayroll";
import EmployeeRequestHub from "./components/EmployeeRequestHub";
import ApprovalCenter from "./components/ApprovalCenter";
import SurveyBuilder from "./components/SurveyBuilder";
import CompanyManagement from "./components/CompanyManagement";
import PayrollHub from "./components/PayrollHub";
import SchedulePlanner from "./components/SchedulePlanner";
import WorkRecordsLog from "./components/WorkRecordsLog";
import EmployeeSurveys from "./components/EmployeeSurveys";
import AIRecommendationsHub from "./components/AIRecommendationsHub.jsx";
import Chat from "./pages/Chat";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>

      {/* --- RUTAS PÚBLICAS --- */}
      {/*<Route path="/" element={<Home />} />*/}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<CompanySignup />} />
      <Route path="/demo"   element={<Demo />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/" element={<LandingPage />} />

      {/* --- RUTAS DE EMPLEADO --- */}
      <Route element={<PrivateRoute allowedRoles={["EMPLOYEE"]}><EmployeeLayout /></PrivateRoute>}>
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/my-work-records" element={<MyWorkRecords />} />
        <Route path="/my-payroll" element={<MyPayroll />} />
        <Route path="/my-schedules" element={<MySchedules />} />
        <Route path="/report-request" element={<EmployeeRequestHub />} />
        <Route path="/wellness-survey" element={<WellnessSurvey />} />
        <Route path="/survey" element={<EmployeeSurveys />} />
        <Route path="/chat" element={<Chat />} />
      </Route>

      {/* --- RUTAS PROTEGIDAS PARA EMPRESAS --- */}
      <Route path="/employee-details/:id" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><EmployeeDetails /></PrivateRoute>} />
      <Route path="/edit-employee/:id" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><EditEmployee /></PrivateRoute>} />
      <Route
        path="/company-dashboard"
        element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><CompanyDashboard /></PrivateRoute>}
      />
      <Route path="/manage-approvals" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><ApprovalCenter /></PrivateRoute>} />
      <Route path="/survey-builder" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><SurveyBuilder /></PrivateRoute>} />
      <Route path="/payroll-hub" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><PayrollHub /></PrivateRoute>} />
      <Route path="/work-logs" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><WorkRecordsLog /></PrivateRoute>} />
      <Route path="/create-employee" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><CreateEmployee /></PrivateRoute>} />
      <Route
        path="/manage-employees"
        element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><ManageEmployees /></PrivateRoute>}
      />
      <Route path="/schedule-planner" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><SchedulePlanner /></PrivateRoute>} />
      <Route path="/AIRecommendationsHub" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><AIRecommendationsHub /></PrivateRoute>} />
      <Route path="/chat/:employeeId" element={<PrivateRoute allowedRoles={["COMPANY", "ADMIN"]}><Chat /></PrivateRoute>} />

      {/* --- RUTAS DE ADMINISTRADOR --- */}
      <Route path="/admin-dashboard"  element={<PrivateRoute allowedRoles={["ADMIN"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/manage-companies" element={<PrivateRoute allowedRoles={["ADMIN"]}><CompanyManagement /></PrivateRoute>} />
      <Route path="/audit-logs" element={<PrivateRoute allowedRoles={["ADMIN"]}><AuditLog /></PrivateRoute>} />

    </Route>
  )
);
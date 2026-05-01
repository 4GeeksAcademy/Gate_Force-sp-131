// Import necessary components and functions from react-router-dom.

import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Company from "./pages/Company";
import Employees from "./pages/Employees";
import EmployeesNew from "./pages/EmployeesNew.jsx";
import EmployeesEdit from "./pages/EmployeesEdit.jsx";
import DashboardEmployee from "./pages/DashboardEmployee";
import Admin from "./components/Admin.jsx";
import Nominas from "./pages/Nominas.jsx";
import NominasForm from "./pages/NominasForm.jsx";
import Workrecord from "./pages/Workrecord.jsx";
import WorkRecordForm from "./pages/WorkRecordForm.jsx";
import Horarios from "./pages/Horarios.jsx";
import Vacaciones from "./pages/Vacaciones.jsx";
import Managers from "./pages/Managers.jsx";
import LoginCompany from "./pages/LoginCompany.jsx";
import DashBoardCompany from "./pages/DashBoardCompany.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import SignupCompany from "./pages/SignupCompany.jsx";
import VacacionesNew from "./pages/VacacionesNew.jsx";
import SignupEmployee from "./pages/SignupEmployee.jsx";
import LoginEmployee from "./pages/LoginEmployee.jsx";
import LoginAdmin from "./pages/LoginAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeesSchedules from "./components/EmployeesSchedules.jsx";
import MisNominas from "./pages/MisNominas.jsx";
import CompanyNew from "./pages/CompanyNew.jsx";
import CompanyEdit from "./pages/CompanyEdit.jsx";
import SolicitarVacaciones from "./pages/SolicitarVacaciones.jsx";
import CompanyIncidentsManager from "./components/CompanyIncidentsManager.jsx";
import EmployeeIncidents from "./pages/EmployeeIncidents.jsx";
import CompanySurveys from "./components/CompanySurveys.jsx";
import EmployeeSurveys from "./components/EmployeeSurveys.jsx";
import CompanyManagersControl from "./components/CompanyManagersControl.jsx";
import DashboardManager from "./pages/DashboardManager.jsx";
import VacacionesCompany from "./components/CompanyVacation.jsx";


export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />

      <Route
        path="/employees"
        element={
          <RutaProtegida allowedRole="company">
            <Employees />
          </RutaProtegida>
        }
      />
      <Route
        path="/employee-dashboard"
        element={
          <RutaProtegida allowedRole="employee">
            <DashboardEmployee />
          </RutaProtegida>
        }
      />
      <Route
        path="/employees/new"
        element={
          <RutaProtegida allowedRole="company">
            <EmployeesNew />
          </RutaProtegida>
        }
      />
      <Route
        path="/employees/edit/:id"
        element={
          <RutaProtegida allowedRole="company">
            <EmployeesEdit />
          </RutaProtegida>
        }
      />
      <Route path="/login-employee" element={<LoginEmployee />} />
      <Route path="/signup-employee" element={<SignupEmployee />} />
      <Route
        path="/employees/schedules"
        element={
          <RutaProtegida allowedRole="employee">
            <EmployeesSchedules />
          </RutaProtegida>
        }
      />

      <Route
        path="/managers"
        element={
          <RutaProtegida allowedRole="company">
            <Managers />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin"
        element={
          <RutaProtegida allowedRole="admin">
            <Admin />
          </RutaProtegida>
        }
      />

      <Route path="/login-company" element={<LoginCompany />} />
      <Route path="/signup-company" element={<SignupCompany />} />
      <Route
        path="/company-dashboard"
        element={
          <RutaProtegida allowedRole="company">
            <DashBoardCompany />
          </RutaProtegida>
        }
      />
      <Route
        path="/company"
        element={
          <RutaProtegida allowedRole="admin">
            <Company />
          </RutaProtegida>
        }
      />
      <Route
        path="/horarios/:employeeId"
        element={
          <RutaProtegida allowedRole="company">
            <Horarios />
          </RutaProtegida>
        }
      />

      <Route path="/vacaciones" element={<Vacaciones />} />
      <Route path="/vacaciones/new" element={<VacacionesNew />} />


      <Route
        path="/nominas"
        element={
          <RutaProtegida allowedRole="company">
            <Nominas />
          </RutaProtegida>
        }
      />
      <Route
        path="/nominas/new"
        element={
          <RutaProtegida allowedRole="company">
            <NominasForm />
          </RutaProtegida>
        }
      />
      <Route
        path="/nominas/edit/:id"
        element={
          <RutaProtegida allowedRole="company">
            <NominasForm />
          </RutaProtegida>
        }
      />
      <Route
        path="/mis-nominas"
        element={
          <RutaProtegida allowedRole="employee">
            <MisNominas />
          </RutaProtegida>
        }
      />

      <Route path="/work-records" element={<Workrecord />} />
      <Route path="/work-records/new" element={<WorkRecordForm />} />
      <Route path="/work-records/edit/:id" element={<WorkRecordForm />} />

      <Route path="/incidents" element={<CompanyIncidentsManager />} />
      <Route path="/employee/:employeeId/incidents" element={<EmployeeIncidents />} />

      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route
        path="/admin-dashboard"
        element={
          <RutaProtegida allowedRole="admin">
            <AdminDashboard />
          </RutaProtegida>
        }
      />
      <Route
        path="/company/new"
        element={
          <RutaProtegida allowedRole="company">
            <CompanyNew />
          </RutaProtegida>
        }
      />

      <Route
        path="/company/edit/:id"
        element={
          <RutaProtegida allowedRole="company">
            <CompanyEdit />
          </RutaProtegida>
        }
      />
      <Route path="/surveys" element={<CompanySurveys />} />
      <Route path="/employee/:employeeId/surveys" element={<EmployeeSurveys />} />
      <Route path="/manage-roles" element={<CompanyManagersControl />} />
      <Route path="/manager-dashboard" element={<DashboardManager />} />
      <Route path="/company-vacations" element={<VacacionesCompany />} />
    </Route>


  )
);

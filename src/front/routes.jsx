// Import necessary components and functions from react-router-dom.

import {createBrowserRouter, createRoutesFromElements, Route,} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Company from "./pages/Company";
import Employees from "./pages/Employees";
import Admin from "./components/Admin.jsx";
import Nominas from "./pages/Nominas.jsx";
import NominasForm from "./pages/NominasForm.jsx";
import Workrecord from "./pages/Workrecord.jsx"
import WorkRecordForm from "./pages/WorkRecordForm.jsx"
import Horarios from "./pages/Horarios.jsx"
import Incidents from "./pages/Incidents.jsx";
import IncidentNew from "./pages/IncidentNew.jsx";
import IncidentEdit from "./pages/IncidentEdit.jsx";
import IncidentDelete from "./pages/IncidentDelete.jsx";
import Vacaciones from "./pages/Vacaciones.jsx";
import LoginCompany from "./pages/LoginCompany.jsx";
import DashBoardCompany from "./pages/DashBoardCompany.jsx"
import RutaProtegida from "./components/RutaProtegida.jsx"
import SignupCompany from "./pages/SignupCompany.jsx";

import VacacionesNew from "./pages/VacacionesNew.jsx";
import VacacionesEdit from "./pages/VacacionesEdit.jsx";
import VacacionesDelete from "./pages/VacacionesDelete.jsx";


export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/demo" element={<Demo />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/company" element={<Company />} />
      <Route path="/nominas" element={<Nominas />} />
      <Route path="/nominas/new" element={<NominasForm />} />
      <Route path="/nominas/edit/:id" element={<NominasForm />} />
      <Route path="/work-records" element={<Workrecord />} />
      <Route path="/work-records/new" element={<WorkRecordForm />} />
      <Route path="/work-records/edit/:id" element={<WorkRecordForm />} />
      <Route path="/horarios/:employeeId" element={<Horarios />} />


      <Route path="/incidents/new" element={<IncidentNew />} />
      <Route path="/incidents/edit/:id" element={<IncidentEdit />} />
      <Route path="/incidents/delete" element={<IncidentDelete />} />
      <Route path="/incidents" element={<Incidents />} />
      <Route path="/vacaciones" element={<Vacaciones />} />
      <Route path="/login-company" element={<LoginCompany />} />
      <Route
        path="/company-dashboard"
        element={
          <RutaProtegida allowedRole="company">
            <DashBoardCompany />
          </RutaProtegida>
        }
      />
      <Route path="/signup-company" element={<SignupCompany />} />

      <Route path="/vacaciones/new" element={<VacacionesNew />} />
      <Route path="/vacaciones/edit/:id" element={<VacacionesEdit />} />
      <Route path="/vacaciones/delete" element={<VacacionesDelete />} />


    </Route>
  )
)
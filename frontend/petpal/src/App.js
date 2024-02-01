import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.min.js";
import "./style.css";
import Signup from "./pages/Accounts/signup";
import Landing from "./pages/landing";
import Login from "./pages/Accounts/login";
import NotFound from "./components/notfound";
import Account from "./pages/Accounts/accountupdate";
import SeekerPublicProfile from "./pages/Accounts/seekerprofile";
import Notifications from "./pages/Notifications/notifications";
import Forbidden from "./components/forbidden";
import PetDetails from "./pages/pets/petdetails";
import PetCreation from "./pages/pets/petcreation";
import PetUpdate from "./pages/pets/petupdate";
import PetSearch from "./pages/pets/petsearch";
import ShelterDetail from "./pages/shelter/ShelterDetail";
import ShelterManagement from "./pages/shelter/ShelterManagement";
import ApplicationCreation from "./pages/application/applicationCreate";
import ApplicationDetail from "./pages/application/applicationDetail";
import ShelterList from "./pages/shelter/shelterList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="" element={<Landing />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/403" element={<Forbidden />} />

        <Route path="/account" element={<Account />} />
        <Route path="/seeker/:username" element={<SeekerPublicProfile />} />
        <Route path="/petcreation" element={<PetCreation />} />
        <Route path="/petsearch" element={<PetSearch />} />
        <Route path="/petdetails/:pk" element={<PetDetails />} />
        <Route path="/petupdate/:petId" exact element={<PetUpdate />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/shelter/:username" element={<ShelterDetail />} />
        <Route path="/shelter/:username/management" element={<ShelterManagement />}/>
        <Route path="/shelterlist" element={<ShelterList />} />

        <Route path="/application/create" element={<ApplicationCreation />} />
        <Route path="/application/:appId" element={<ApplicationDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

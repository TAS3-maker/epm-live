import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import Login from "./components/pages/Login";
import AppRoutes from "./components/Routes";
import RedirectByRole from "./components/utils/RedirectByRole";
import ForgetPassword from "./components/pages/ForgetPassword";
import Profile from "./components/pages/Profile";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* <RedirectByRole /> Include the component here */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/updatepassword" element={<ForgetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

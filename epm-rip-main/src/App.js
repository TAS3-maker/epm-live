import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import Login from "./components/pages/Login";
import AppRoutes from "./components/Routes";
import RedirectByRole from "./components/utils/RedirectByRole";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* <RedirectByRole /> Include the component here */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

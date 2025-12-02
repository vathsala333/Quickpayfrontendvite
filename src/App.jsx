import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PaymentHistory from "./components/PaymentHistory";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
           <Route path="/signup" element={<Signup />} /> 
      <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset/:token" element={<ResetPassword />} />
<Route path="/dashboard" element={<Dashboard />} /> 
<Route path="/history" element={<PaymentHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
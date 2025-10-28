import { Routes, Route } from "react-router-dom"
import Home from "./pages/home/Home"
import Navbar from "./components/navbar/Navbar"
import Footer from "./components/footer"
import AboutCLN from "./pages/about-us/AboutUs"
import Service from "./pages/services/Service"
import Products from "./pages/products/Product"
import ContactUs from "./pages/contact-us/contact-us"
import SignupPage from "./pages/auth/SignupPage"
import VerifyEmail from "./pages/auth/VerifyEmail";
import LoginPage from "./pages/auth/Login"
import VerifyOTPPage from "./pages/auth/VerifyOTPPage"
import ProtectedRoute from "./auth/ProtectedRoute"
import AdminPenal from "./admin/AdminPenal"

function App() {
  return (
    <>
    <Navbar/>
     <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about-us" element={<AboutCLN/>}/>
        <Route path="/services" element={<Service/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/contact-us" element={<ContactUs/>}/>
        <Route path="/auth/sign-up" element={<SignupPage/>}/>
        <Route path="/auth/login" element={<LoginPage/>}/>
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/verify-otp" element={<VerifyOTPPage />} />

        {/* Admin Panel (Protected) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminPenal />
            </ProtectedRoute>
          }
        />
     </Routes>
     <Footer/>
    </>
  )
}

export default App

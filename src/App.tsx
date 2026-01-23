import { Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/home/Home"
import Navbar from "./components/navbar/Navbar"
import Footer from "./components/footer"
import AboutCLN from "./pages/about-us/AboutUs"
import Service from "./pages/services/Service"
import Products from "./pages/products/Product"
import ContactUs from "./pages/contact-us/contact-us"
import SignupPage from "./pages/auth/SignupPage"
import VerifyEmail from "./pages/auth/VerifyEmail"
import LoginPage from "./pages/auth/Login"
import VerifyOTPPage from "./pages/auth/VerifyOTPPage"
import ProtectedRoute from "./auth/ProtectedRoute"
import AdminPenal from "./admin/AdminPenal"
import PriceApp from "./pages/price/App"
import ForgetPassword from "./pages/auth/ForgetPassword"
import ResetPassword from "./pages/auth/ResetPassword"

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPriceRoute = location.pathname.startsWith('/price');
  
  return (
    <>
      {/* Hide Navbar for Admin and Price routes */}
      {!isAdminRoute && !isPriceRoute && <Navbar/>}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home/>}/>
        <Route path="/about-us" element={<AboutCLN/>}/>
        <Route path="/services" element={<Service/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/contact-us" element={<ContactUs/>}/>
        
        {/* Auth Routes */}
        <Route path="/auth/sign-up" element={<SignupPage/>}/>
        <Route path="/auth/login" element={<LoginPage/>}/>
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/auth/forget-password" element={<ForgetPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Price Module - Public (Get Quote) */}
        <Route 
          path="/price/quote" 
          element={
            <ProtectedRoute role={["USER", "ADMIN"]}>
              <PriceApp 
                defaultTab="quote"
                showHeader={true}
                showFooter={true}
              />
            </ProtectedRoute>
          }
        />

        {/* Price Module - Protected (History & Admin) */}
        <Route 
          path="/price/history" 
          element={
            <ProtectedRoute role={["USER", "ADMIN"]}>
              <PriceApp 
                defaultTab="history"
                showHeader={true}
                showFooter={true}
              />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/price/admin" 
          element={
            <ProtectedRoute role="ADMIN">
              <PriceApp 
                defaultTab="ADMIN"
                showHeader={true}
                showFooter={true}
              />
            </ProtectedRoute>
          }
        />

        {/* Admin Panel (Protected) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminPenal />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Hide Footer for Admin and Price routes */}
      {!isAdminRoute && !isPriceRoute && <Footer/>}
    </>
  )
}

export default App
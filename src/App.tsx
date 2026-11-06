import { lazy, Suspense } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/navbar/Navbar"
import Footer from "./components/footer"
import ProtectedRoute from "./auth/ProtectedRoute"

// Phase 6: every route is code-split so the homepage no longer ships admin/price/auth code
const importHome = () => import("./pages/home/Home")
const Home = lazy(importHome)
// Landing on "/" starts the Home chunk download right away instead of after the router resolves
if (typeof window !== "undefined" && window.location.pathname === "/") void importHome()
const AboutCLN = lazy(() => import("./pages/about-us/AboutUs"))
const Service = lazy(() => import("./pages/services/Service"))
const Products = lazy(() => import("./pages/products/Product"))
const SignupPage = lazy(() => import("./pages/auth/SignupPage"))
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"))
const LoginPage = lazy(() => import("./pages/auth/Login"))
const VerifyOTPPage = lazy(() => import("./pages/auth/VerifyOTPPage"))
const AdminPenal = lazy(() => import("./admin/AdminPenal"))
const PriceApp = lazy(() => import("./pages/price/App"))
const ForgetPassword = lazy(() => import("./pages/auth/ForgetPassword"))
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"))
const FreightQuotePage = lazy(() => import("./pages/price/pages/FreightQuotePage"))
const ContactUs = lazy(() => import("./pages/contact-us/contact-us"))

const RouteFallback = () => (
  <div role="status" aria-live="polite" className="flex min-h-[60svh] items-center justify-center">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-cln-mist border-t-cln-green" />
    <span className="sr-only">Loading…</span>
  </div>
)

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPriceRoute = location.pathname.startsWith('/price');
  
  return (
    <>
      {/* Hide Navbar for Admin and Price routes */}
      {!isAdminRoute && !isPriceRoute && <Navbar/>}
      
      <Suspense fallback={<RouteFallback />}>
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
            <ProtectedRoute role="USER">
              <PriceApp
                showHeader={true}
                showFooter={true}
              />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/freight-quote" 
          element={
            <ProtectedRoute role="USER">
              <FreightQuotePage />
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
      </Suspense>

      {/* Hide Footer for Admin and Price routes */}
      {!isAdminRoute && !isPriceRoute && <Footer/>}
    </>
  )
}

export default App
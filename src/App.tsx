import { Routes, Route } from "react-router-dom"
import Home from "./pages/home/Home"
import Navbar from "./components/navbar/Navbar"
import Footer from "./components/footer"
import AboutCLN from "./pages/about-us/AboutUs"
import Service from "./pages/services/Service"
import Products from "./pages/products/Product"
import ContactUs from "./pages/contact-us/contact-us"
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
     </Routes>
     <Footer/>
    </>
  )
}

export default App

import { Routes, Route, Navigate } from "react-router-dom";
import AdminNavbar from "./components/AdminNavbar";
import Dashboard from "./pages/dashboard/Dashboard";
import CategoryList from "./pages/category/CategoryList";
import Profile from "./pages/profile/Profile";
import ProductList from "./pages/product/ProductList";
import ProductForm from "./pages/product/ProductForm";
import SEOList from "./pages/seo/SeoList";
import SEOForm from "./pages/seo/SeoForm";
import UserList from "./pages/user/UserList";
import UserForm from "./pages/user/UserForm";
import CategoryForm from "./pages/category/CategoryForm";

const AdminPanel = () => {
  return (
    <div className="flex min-h-screen">
      <AdminNavbar />
      <div className="flex-1 md:ml-0 pt-16 md:pt-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="category" element={<CategoryList />} />
          <Route path="category/create" element={<CategoryForm />} />
          <Route path="category/edit/:id" element={<CategoryForm />} />
          <Route path="product" element={<ProductList />} />
          <Route path="product/create" element={<ProductForm />} />
          <Route path="product/edit/:id" element={<ProductForm />} />
          <Route path="seo" element={<SEOList />} />
          <Route path="seo/create" element={<SEOForm />} />
          <Route path="seo/edit/:id" element={<SEOForm />} />
          <Route path="user" element={<UserList />} />
          <Route path="user/create" element={<UserForm />} />
          <Route path="user/edit/:id" element={<UserForm />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;

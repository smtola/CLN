import { NavLink } from "react-router-dom";

const AdminNavbar = () => {
  return (
    <nav className="w-64 bg-[#c4ffc0] text-[#4FB748] min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <ul>
        <li className="mb-2"><NavLink to="/admin" end className={({isActive}) => isActive ? "text-[#EE3A23] border-b border-[#ee3a23]" : ""}>Dashboard</NavLink></li>
        <li className="mb-2"><NavLink to="/admin/category" className={({isActive}) => isActive ? "text-[#EE3A23] border-b border-[#ee3a23]" : ""}>Categories</NavLink></li>
        <li className="mb-2"><NavLink to="/admin/product" className={({isActive}) => isActive ? "text-[#EE3A23] border-b border-[#ee3a23]" : ""}>Products</NavLink></li>
        <li className="mb-2"><NavLink to="/admin/seo" className={({isActive}) => isActive ? "text-[#EE3A23] border-b border-[#ee3a23]" : ""}>SEO</NavLink></li>
        <li className="mb-2"><NavLink to="/admin/profile" className={({isActive}) => isActive ? "text-[#EE3A23] border-b border-[#ee3a23]" : ""}>Profile</NavLink></li>
        <li className="mb-2"><NavLink to="/admin/user" className={({isActive}) => isActive ? "text-[#EE3A23] border-b border-[#ee3a23]" : ""}>Users</NavLink></li>
      </ul>
    </nav>
  )
}

export default AdminNavbar;

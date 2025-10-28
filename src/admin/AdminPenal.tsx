import { Navigate, Route, Routes } from "react-router-dom"
import AdminNavbar from "./components/AdminNavbar"
import Dashboard from "./Dashboard"

const AdminPenal = () => {
  return (
    <div className="flex">
        <AdminNavbar />
        <div className="flex-1 p-4">
            <Routes>
                <Route path="/" element={<Dashboard />}/>
                <Route path="*" element={<Navigate to="/admin" />}/>
            </Routes>
        </div>
    </div>
  )
}

export default AdminPenal
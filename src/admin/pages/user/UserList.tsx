import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser } from "../../services/userService";
import type { User } from "../../../types/auth";
import { confirmDelete, showError, showSuccess } from "../../utils/swalHelper";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      // Ensure we always have an array
      if (Array.isArray(res)) {
        setUsers(res);
      } else {
        console.error('Invalid response format:', res);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete(
      "Delete User?",
      "Are you sure you want to delete this user? This action cannot be undone.",
      "Yes, delete it!"
    );

    if (!confirmed) return;

    try {
      await deleteUser(id);
      await showSuccess("Deleted!", "User has been deleted successfully.", 1500);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      await showError("Error", "Failed to delete user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Users</h1>
        <button
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium text-sm md:text-base"
          onClick={() => navigate("/admin/user/create")}
        >
          + Add User
        </button>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
          <p className="text-gray-500 text-base md:text-lg">No users found.</p>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm md:text-base"
            onClick={() => navigate("/admin/user/create")}
          >
            Create your first user
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, idx) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.username || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                          onClick={() => navigate(`/admin/user/edit/${user._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="md:hidden space-y-4">
            {users.map((user, idx) => (
              <div key={user._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">ID</h3>
                    <p className="text-base font-semibold text-gray-900 mt-1">{idx + 1}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Username</h3>
                    <p className="text-base font-semibold text-gray-900 mt-1">{user.username || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</h3>
                    <p className="text-sm text-gray-600 mt-1 break-all">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Role</h3>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Verified</h3>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${
                      user.is_verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-gray-200">
                    <button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => navigate(`/admin/user/edit/${user._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserList;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsersRound, Pencil, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { deleteUser, getUsers } from "../../services/userService";
import type { User } from "../../../types/auth";
import { confirmDelete, showError, showSuccess, getApiErrorMessage } from "../../utils/swalHelper";

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
      showError("Failed to load users", getApiErrorMessage(err, "Could not load users. Please try again."));
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
      "Delete Category?",
      "Are you sure you want to delete this account? This action cannot be undone.",
      "Yes, delete it!"
    );

    if (!confirmed) return;

    try {
      await deleteUser(id);
      await showSuccess("Deleted!", "Account has been deleted successfully.", 1500);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting category:', error);
      await showError("Error", "Failed to delete account. Please try again.");
    }
  };

  const activeUsers = users.filter((user) => !user.is_deleted);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          <p className="text-sm text-slate-500">Loading users…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage accounts and access roles.</p>
        </div>
      </div>

      {activeUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-sm md:p-12">
          <UsersRound className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No users found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Verified</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeUsers.map((user, idx) => (
                    <tr key={idx} className="transition-colors duration-150 hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-400">{idx + 1}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-sm font-medium text-slate-900">
                        {(user.uai.firstName + " " + user.uai.lastName).trim() || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-600">
                        {user.uai.businessEmail}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.is_verified
                              ? "bg-teal-50 text-teal-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.is_verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                          {user.is_verified ? "Verified" : "Not verified"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => navigate(`/admin/user/edit/${user._id}`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(user._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
          <div className="space-y-3 md:hidden">
            {activeUsers.map((user, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {(user.uai.firstName + " " + user.uai.lastName).trim() || "N/A"}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{user.uai.businessEmail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">#{idx + 1}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role || "user"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.is_verified
                        ? "bg-teal-50 text-teal-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user.is_verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                    {user.is_verified ? "Verified" : "Not verified"}
                  </span>
                </div>

                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100"
                    onClick={() => navigate(`/admin/user/edit/${user._id}`)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100"
                    onClick={() => handleDelete(user._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
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
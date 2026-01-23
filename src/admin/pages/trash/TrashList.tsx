import { useEffect, useState } from "react";
import { emptyTrash, getUsers, recoveredUser } from "../../services/userService";
import type { User } from "../../../types/auth";
import { confirmDelete, showError, showSuccess } from "../../utils/swalHelper";

const TrashList = () => {
  const [trashes, setTrashes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setTrashes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setTrashes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRecovery = async (id: string) => {
    setLoading(true);

    try {
      if (id) {
        const payload = {
          is_deleted: false
        };
        const res = await recoveredUser(id, payload);
        showSuccess(res.msg);
      }
    } catch (err) {
      console.error(err);
      showError("Something went wrong!");
    } finally {
      fetchUsers();
      setLoading(false);
    }
  };

  const handleEmpty = async (id: string) => {
    const confirmed = await confirmDelete(
      "Delete Category?",
      "Are you sure you want to removed this account? This action cannot be undone.",
      "Yes, removed it!"
    );

    if (!confirmed) return;

    try {
      await emptyTrash(id);
      await showSuccess("Empty Trash!", "Account has been removed successfully.", 1500);
      fetchUsers();
    } catch (error) {
      console.error('Error removed account:', error);
      await showError("Error", "Failed to removed account. Please try again.");
    }
  };

  // ✅ IMPORTANT: derive deleted users once
  const deletedUsers = trashes.filter(user => user.is_deleted);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Trashes
        </h1>
      </div>

      {/* ✅ EMPTY TRASH */}
      {deletedUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <div className="text-5xl mb-4">🗑️</div>
          <p className="text-gray-500 text-lg">Trash is empty</p>
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {deletedUsers.map((user, idx) => (
                    <tr key={user._id.$oid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{idx + 1}</td>

                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {user.uai.firstName} {user.uai.lastName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {user.uai.businessEmail}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.is_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {user.is_verified ? "Verified" : "Not Verified"}
                        </span>
                      </td>

                      <td className="flex flex-row gap-2 px-6 py-4 text-right">
                      <button
                        className="w-full bg-yellow-500 text-white py-2 rounded mt-3"
                        onClick={() => handleRecovery(user._id.$oid)}
                      >
                        Recovery
                      </button>
                      <button
                        className="w-full bg-red-500 text-white py-2 rounded mt-3"
                        onClick={() => handleEmpty(user._id.$oid)}
                      >
                        Remove
                      </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="md:hidden space-y-4">
            {deletedUsers.map((user, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4">
                <div className="space-y-2">
                  <p className="font-semibold">
                    {user.uai.firstName} {user.uai.lastName}
                  </p>

                  <p className="text-sm break-all">
                    {user.uai.businessEmail}
                  </p>

                  <div className="flex flex-row gap-2">
                    <button
                      className="w-fit px-3 bg-yellow-500 text-white py-2 rounded mt-3"
                      onClick={() => handleRecovery(user._id.$oid)}
                    >
                      Recovery
                    </button>
                    <button
                      className="w-fit px-3 bg-red-500 text-white py-2 rounded mt-3"
                      onClick={() => handleEmpty(user._id.$oid)}
                    >
                      Remove
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

export default TrashList;

import { useEffect, useState } from "react";
import { emptyTrash, getUsers, recoveredUser } from "../../services/userService";
import type { User } from "../../../types/auth";
import { confirmDelete, showError, showSuccess, getApiErrorMessage } from "../../utils/swalHelper";
import { Trash2, RotateCcw, ShieldCheck, ShieldAlert, Inbox } from "lucide-react";

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
      showError("Failed to load trash", getApiErrorMessage(err, "Could not load trashed accounts. Please try again."));
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
      showError("Something went wrong!", getApiErrorMessage(err, "Failed to recover this account. Please try again."));
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Trash</h1>
          <p className="mt-1 text-sm text-slate-500">Recover or permanently remove deleted accounts.</p>
        </div>
      </div>

      {/* ✅ EMPTY TRASH */}
      {deletedUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-sm md:p-12">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">Trash is empty</p>
          <p className="mt-1 text-sm text-slate-500">Deleted accounts will show up here.</p>
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
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
                  {deletedUsers.map((user, idx) => (
                    <tr key={user._id} className="transition-colors duration-150 hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 text-sm text-slate-400">{idx + 1}</td>

                      <td className="px-6 py-3.5">
                        <div className="text-sm font-medium text-slate-900">
                          {user.uai.firstName} {user.uai.lastName}
                        </div>
                      </td>

                      <td className="px-6 py-3.5 text-sm text-slate-600">
                        {user.uai.businessEmail}
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
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

                      <td className="px-6 py-3.5 text-right">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => handleRecovery(user._id)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Recover
                        </button>
                        <button
                          className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleEmpty(user._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
          <div className="space-y-3 md:hidden">
            {deletedUsers.map((user, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  {user.uai.firstName} {user.uai.lastName}
                </p>
                <p className="mt-0.5 break-all text-sm text-slate-500">
                  {user.uai.businessEmail}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role}
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
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors duration-150 hover:bg-amber-100"
                    onClick={() => handleRecovery(user._id)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Recover
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100"
                    onClick={() => handleEmpty(user._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
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

export default TrashList;
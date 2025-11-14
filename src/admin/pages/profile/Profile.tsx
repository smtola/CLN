import { useEffect, useState } from "react";
import { getUser } from "../../../authStorage";
import type { DecodeToken } from "../../../types/auth";

const Profile = () => {
  const [user, setUser] = useState<DecodeToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userToken = await getUser();
        setUser(userToken);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">Manage your account information here.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0">
              {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{user.username || 'User'}</h2>
              <p className="text-sm md:text-base text-gray-600 break-all">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Username</label>
              <p className="mt-2 text-base md:text-lg text-gray-900">{user.username || 'N/A'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
              <p className="mt-2 text-base md:text-lg text-gray-900 break-all">{user.email || 'N/A'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Role</label>
              <p className="mt-2">
                <span className={`px-3 py-1 inline-flex text-xs md:text-sm leading-5 font-semibold rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role || 'user'}
                </span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Verification Status</label>
              <p className="mt-2">
                <span className={`px-3 py-1 inline-flex text-xs md:text-sm leading-5 font-semibold rounded-full ${
                  user.isVerify 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isVerify ? 'Verified' : 'Not Verified'}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Account Information</h3>
            <p className="text-xs md:text-sm text-gray-600">
              For security reasons, some account settings can only be changed by administrators.
              If you need to update your information, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
  
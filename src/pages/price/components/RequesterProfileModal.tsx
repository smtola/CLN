import { useEffect, useState } from 'react';
import { getUserById } from '../../../admin/services/userService';
import type { Profile } from '../../../types/auth';
import { getApiErrorMessage } from '../../../utils/swalHelper';

const RequesterProfileModal = ({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getUserById(userId)
      .then(res => { if (active) setProfile(res.data); })
      .catch(err => { if (active) setError(getApiErrorMessage(err, 'Failed to load user profile')); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [userId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.65)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        style={{ maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: '#1B4F8A' }}>
          <h3 className="text-white font-bold text-base">Requester Profile</h3>
          <button onClick={onClose} className="text-slate-100 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && profile && (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Name</p>
                <p className="text-sm font-semibold text-slate-800">
                  {profile.uai.firstName} {profile.uai.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email</p>
                <p className="text-sm text-slate-700">{profile.uai.businessEmail}</p>
              </div>
              {profile.uai.phoneNumber && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                  <p className="text-sm text-slate-700">{profile.uai.phoneNumber}</p>
                </div>
              )}
              {profile.uai.jobTitle && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Job Title</p>
                  <p className="text-sm text-slate-700">{profile.uai.jobTitle}</p>
                </div>
              )}
              {profile.ci?.companyName && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Company</p>
                  <p className="text-sm text-slate-700">{profile.ci.companyName}</p>
                </div>
              )}
              {profile.role && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Role</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {profile.role}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end px-6 py-4 border-t bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-white"
            style={{ borderColor: '#e2e8f0', color: '#475569' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequesterProfileModal;
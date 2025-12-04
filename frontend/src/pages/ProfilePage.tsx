import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { logout } from '../store/slices/authSlice'
import { ROLES } from '../hooks/usePermission'

// Role display config
const roleConfig: Record<string, { label: string; className: string }> = {
  ADMIN: { label: 'مدیر سیستم', className: 'bg-red-500/20 text-red-400' },
  GYM_OWNER: { label: 'صاحب باشگاه', className: 'bg-purple-500/20 text-purple-400' },
  MANAGER: { label: 'مدیر', className: 'bg-blue-500/20 text-blue-400' },
  RECEPTIONIST: { label: 'پذیرش', className: 'bg-green-500/20 text-green-400' },
  TRAINER: { label: 'مربی', className: 'bg-orange-500/20 text-orange-400' },
  MEMBER: { label: 'عضو', className: 'bg-slate-500/20 text-slate-400' },
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    if (confirm('آیا از خروج مطمئن هستید؟')) {
      dispatch(logout())
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-white">پروفایل</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="card mb-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl text-white font-bold flex-shrink-0">
              {user?.firstName?.charAt(0) || user?.phoneNumber?.charAt(0) || '?'}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.fullName || user?.firstName || 'کاربر'}
              </h2>
              <p className="text-slate-400 flex items-center gap-2 font-mono" dir="ltr">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {user?.phoneNumber}
              </p>

              {/* Roles */}
              <div className="flex flex-wrap gap-2 mt-3">
                {user?.roles?.map((role) => {
                  const config = roleConfig[role] || { label: role, className: 'bg-slate-500/20 text-slate-400' }
                  return (
                    <span key={role} className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
                      {config.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <h2 className="text-lg font-semibold text-white mb-4">اطلاعات حساب</h2>
        <div className="card mb-8">
          <div className="space-y-4">
            {/* Phone */}
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">شماره موبایل</p>
                  <p className="text-white font-mono" dir="ltr">
                    {user?.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            {user?.email && (
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">ایمیل</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Name */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">نام و نام‌خانوادگی</p>
                  <p className="text-white">
                    {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'تعیین نشده'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="text-lg font-semibold text-white mb-4">دسترسی سریع</h2>
        <div className="space-y-3 mb-8">
          <Link
            to="/reservations"
            className="card flex items-center justify-between hover:border-primary-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-white">رزروهای من</span>
            </div>
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/classes"
            className="card flex items-center justify-between hover:border-primary-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="text-white">رزرو کلاس جدید</span>
            </div>
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full card flex items-center justify-center gap-2 bg-red-500/10 border-red-500/30 hover:bg-red-500/20 transition-colors text-red-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          خروج از حساب کاربری
        </button>
      </main>
    </div>
  )
}


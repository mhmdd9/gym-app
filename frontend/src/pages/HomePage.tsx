import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { logout } from '../store/slices/authSlice'
import { usePermission, ROLES } from '../hooks/usePermission'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { canManageClubs, canManageSessions, canRecordPayments, isStaff, hasRole } = usePermission()

  const handleLogout = () => {
    dispatch(logout())
  }

  // Role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-500/20 text-red-400',
      GYM_OWNER: 'bg-purple-500/20 text-purple-400',
      MANAGER: 'bg-blue-500/20 text-blue-400',
      RECEPTIONIST: 'bg-green-500/20 text-green-400',
      TRAINER: 'bg-orange-500/20 text-orange-400',
      MEMBER: 'bg-slate-500/20 text-slate-400',
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || colors.MEMBER}`}>{role}</span>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">رزرو باشگاه</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm hidden sm:block">{user?.fullName || user?.phoneNumber}</span>
              {user?.roles?.map((role) => <RoleBadge key={role} role={role} />)}
            </div>
            <button onClick={handleLogout} className="btn btn-secondary text-sm">
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="card mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">سلام{user?.firstName ? ` ${user.firstName}` : ''}! 👋</h1>
          <p className="text-slate-400">به سامانه رزرو باشگاه خوش آمدید</p>
        </div>

        {/* Staff Quick Actions - Only visible to staff */}
        {isStaff && (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">پنل مدیریت</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {hasRole(ROLES.ADMIN) && (
                <Link
                  to="/admin/users"
                  className="card text-right hover:border-red-500/50 transition-colors group cursor-pointer border-red-500/20"
                >
                  <span className="text-3xl mb-3 block">👥</span>
                  <h3 className="text-white font-medium group-hover:text-red-400 transition-colors">
                    مدیریت کاربران
                  </h3>
                  <p className="text-slate-500 text-sm">کاربران و نقش‌ها</p>
                </Link>
              )}
              {canManageClubs && (
                <Link
                  to="/admin/clubs"
                  className="card text-right hover:border-purple-500/50 transition-colors group cursor-pointer border-purple-500/20"
                >
                  <span className="text-3xl mb-3 block">🏢</span>
                  <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    مدیریت باشگاه‌ها
                  </h3>
                  <p className="text-slate-500 text-sm">افزودن و ویرایش باشگاه</p>
                </Link>
              )}
              {canManageSessions && (
                <Link
                  to="/staff/sessions"
                  className="card text-right hover:border-blue-500/50 transition-colors group cursor-pointer border-blue-500/20"
                >
                  <span className="text-3xl mb-3 block">📆</span>
                  <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">مدیریت کلاس‌ها</h3>
                  <p className="text-slate-500 text-sm">برنامه‌ریزی کلاس‌ها</p>
                </Link>
              )}
              {canRecordPayments && (
                <Link
                  to="/staff/payments"
                  className="card text-right hover:border-green-500/50 transition-colors group cursor-pointer border-green-500/20"
                >
                  <span className="text-3xl mb-3 block">💳</span>
                  <h3 className="text-white font-medium group-hover:text-green-400 transition-colors">ثبت پرداخت</h3>
                  <p className="text-slate-500 text-sm">ثبت پرداخت حضوری</p>
                </Link>
              )}
              {hasRole(ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST) && (
                <Link
                  to="/staff/checkin"
                  className="card text-right hover:border-amber-500/50 transition-colors group cursor-pointer border-amber-500/20"
                >
                  <span className="text-3xl mb-3 block">✅</span>
                  <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors">
                    ورود به کلاس
                  </h3>
                  <p className="text-slate-500 text-sm">ثبت حضور اعضا</p>
                </Link>
              )}
            </div>
          </>
        )}

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-white mb-4">دسترسی سریع</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🏋️', label: 'کلاس‌ها', desc: 'مشاهده کلاس‌های ورزشی', to: '/classes' },
            { icon: '📅', label: 'رزروها', desc: 'رزروهای شما', to: '/reservations' },
            { icon: '🏢', label: 'باشگاه‌ها', desc: 'لیست باشگاه‌ها', to: '/clubs' },
            { icon: '👤', label: 'پروفایل', desc: 'تنظیمات حساب', to: '/profile' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="card text-right hover:border-primary-500/50 transition-colors group cursor-pointer"
            >
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="text-white font-medium group-hover:text-primary-400 transition-colors">{item.label}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>

      </main>
    </div>
  )
}


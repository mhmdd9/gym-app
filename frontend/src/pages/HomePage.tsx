import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { logout } from '../store/slices/authSlice'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
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
            <span className="text-slate-300 text-sm hidden sm:block">
              {user?.fullName || user?.phoneNumber}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="card mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            سلام{user?.firstName ? ` ${user.firstName}` : ''}! 👋
          </h1>
          <p className="text-slate-400">به سامانه رزرو باشگاه خوش آمدید</p>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-white mb-4">دسترسی سریع</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🏋️', label: 'کلاس‌ها', desc: 'مشاهده کلاس‌های ورزشی' },
            { icon: '📅', label: 'رزروها', desc: 'رزروهای شما' },
            { icon: '🏢', label: 'باشگاه‌ها', desc: 'لیست باشگاه‌ها' },
            { icon: '👤', label: 'پروفایل', desc: 'تنظیمات حساب' },
          ].map((item) => (
            <button
              key={item.label}
              className="card text-right hover:border-primary-500/50 transition-colors group cursor-pointer"
            >
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="text-white font-medium group-hover:text-primary-400 transition-colors">
                {item.label}
              </h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* Upcoming Classes */}
        <h2 className="text-lg font-semibold text-white mb-4">کلاس‌های پیش‌رو</h2>
        <div className="space-y-4">
          {[
            { name: 'یوگا صبحگاهی', time: '۰۸:۰۰ - ۰۹:۳۰', trainer: 'مریم احمدی', spots: 5 },
            { name: 'بدنسازی', time: '۱۰:۰۰ - ۱۱:۳۰', trainer: 'علی رضایی', spots: 3 },
            { name: 'ایروبیک', time: '۱۴:۰۰ - ۱۵:۰۰', trainer: 'سارا محمدی', spots: 8 },
          ].map((cls, i) => (
            <div key={i} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                  {cls.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-medium">{cls.name}</h3>
                  <p className="text-slate-400 text-sm">{cls.trainer} • {cls.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">{cls.spots} جای خالی</span>
                <button className="btn btn-primary text-sm">رزرو</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}


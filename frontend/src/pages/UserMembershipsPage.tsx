import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as membershipsApi from '../api/memberships'
import type { UserMembership, Attendance } from '../types'

// Status config
const membershipStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'در انتظار پرداخت', className: 'bg-orange-500/20 text-orange-400' },
  ACTIVE: { label: 'فعال', className: 'bg-green-500/20 text-green-400' },
  EXPIRED: { label: 'منقضی', className: 'bg-red-500/20 text-red-400' },
  SUSPENDED: { label: 'معلق', className: 'bg-yellow-500/20 text-yellow-400' },
  CANCELLED: { label: 'لغو شده', className: 'bg-slate-500/20 text-slate-400' },
}

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fa-IR')
}

// Format datetime
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function UserMembershipsPage() {
  const [memberships, setMemberships] = useState<UserMembership[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'memberships' | 'attendance'>('memberships')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [membershipsRes, attendanceRes] = await Promise.all([
        membershipsApi.getMyMemberships(),
        membershipsApi.getMyAttendance(),
      ])
      setMemberships(membershipsRes.data)
      setAttendance(attendanceRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت اطلاعات')
    } finally {
      setIsLoading(false)
    }
  }

  const pendingMemberships = memberships.filter((m) => m.status === 'PENDING')
  const activeMemberships = memberships.filter((m) => m.status === 'ACTIVE')
  const inactiveMemberships = memberships.filter((m) => m.status !== 'ACTIVE' && m.status !== 'PENDING')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-white">اشتراک‌های من</h1>
            </div>
            <Link to="/memberships/purchase" className="btn btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              خرید اشتراک
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('memberships')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'memberships'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            اشتراک‌ها
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'attendance'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            تاریخچه حضور
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/30 text-center py-8">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchData} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Memberships Tab */}
        {!isLoading && !error && activeTab === 'memberships' && (
          <div className="space-y-8">
            {/* Pending Memberships */}
            {pendingMemberships.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-orange-400 mb-4">در انتظار پرداخت</h2>
                <p className="text-slate-400 text-sm mb-4">
                  برای فعال‌سازی این اشتراک‌ها به باشگاه مراجعه و پرداخت کنید
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingMemberships.map((membership) => (
                    <MembershipCard key={membership.id} membership={membership} />
                  ))}
                </div>
              </div>
            )}

            {/* Active Memberships */}
            {activeMemberships.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">اشتراک‌های فعال</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeMemberships.map((membership) => (
                    <MembershipCard key={membership.id} membership={membership} />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Memberships */}
            {inactiveMemberships.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-400 mb-4">اشتراک‌های قبلی</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveMemberships.map((membership) => (
                    <MembershipCard key={membership.id} membership={membership} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {memberships.length === 0 && (
              <div className="card text-center py-12">
                <span className="text-5xl mb-4 block">💳</span>
                <h3 className="text-xl text-white mb-2">هنوز اشتراکی ندارید</h3>
                <p className="text-slate-400 mb-6">برای استفاده از امکانات باشگاه، یک اشتراک خریداری کنید</p>
                <Link to="/memberships/purchase" className="btn btn-primary">
                  خرید اشتراک
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {!isLoading && !error && activeTab === 'attendance' && (
          <div>
            {attendance.length === 0 ? (
              <div className="card text-center py-12">
                <span className="text-5xl mb-4 block">📋</span>
                <h3 className="text-xl text-white mb-2">هنوز حضوری ثبت نشده</h3>
                <p className="text-slate-400">با مراجعه به باشگاه، حضور شما ثبت می‌شود</p>
              </div>
            ) : (
              <div className="card">
                <div className="space-y-3">
                  {attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{formatDateTime(record.checkInTime)}</p>
                          {record.planName && <p className="text-slate-500 text-sm">{record.planName}</p>}
                        </div>
                      </div>
                      {record.notes && (
                        <p className="text-slate-400 text-sm">{record.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Membership Card Component
function MembershipCard({ membership }: { membership: UserMembership }) {
  const status = membershipStatusConfig[membership.status] || membershipStatusConfig.ACTIVE

  return (
    <div className={`card ${membership.status !== 'ACTIVE' && membership.status !== 'PENDING' ? 'opacity-60' : ''}`}>
      {/* Header with status badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-2xl">
            🏋️
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{membership.planName || `اشتراک #${membership.planId}`}</h3>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <span>🏢</span>
              {membership.clubName || `باشگاه #${membership.clubId}`}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
      </div>

      {/* Info grid */}
      <div className="space-y-2 text-sm border-t border-slate-700/50 pt-4">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <span>📅</span> شروع:
          </span>
          <span className="text-white">{formatDate(membership.startDate)}</span>
        </div>

        {membership.endDate && (
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <span>📆</span> پایان:
            </span>
            <span className="text-white">{formatDate(membership.endDate)}</span>
          </div>
        )}
      </div>

      {/* Pending status note */}
      {membership.status === 'PENDING' && (
        <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs">
          ⏳ در انتظار تایید پرداخت - برای فعال‌سازی به باشگاه مراجعه کنید
        </div>
      )}
    </div>
  )
}

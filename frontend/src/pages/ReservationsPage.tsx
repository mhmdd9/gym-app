import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reservationsApi } from '../api/reservations'
import type { Reservation } from '../types'

type TabType = 'active' | 'history'

// Status badge colors and labels
const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: 'در انتظار پرداخت', className: 'bg-yellow-500/20 text-yellow-400' },
  PAID: { label: 'پرداخت شده', className: 'bg-green-500/20 text-green-400' },
  CANCELLED: { label: 'لغو شده', className: 'bg-red-500/20 text-red-400' },
  NO_SHOW: { label: 'عدم حضور', className: 'bg-slate-500/20 text-slate-400' },
  COMPLETED: { label: 'تکمیل شده', className: 'bg-blue-500/20 text-blue-400' },
}

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([])
  const [allReservations, setAllReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [activeRes, allRes] = await Promise.all([
        reservationsApi.getMyActiveReservations(),
        reservationsApi.getMyReservations({ size: 50 }),
      ])

      setActiveReservations(activeRes.data.data)
      setAllReservations(allRes.data.data.content)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت رزروها')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelReservation = async (id: number) => {
    if (!confirm('آیا از لغو این رزرو مطمئن هستید؟')) return

    try {
      setCancellingId(id)
      await reservationsApi.cancelReservation(id)
      await fetchReservations()
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در لغو رزرو')
    } finally {
      setCancellingId(null)
    }
  }

  const displayReservations = activeTab === 'active' ? activeReservations : allReservations

  // Format datetime for display
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
            <h1 className="text-xl font-bold text-white">رزروهای من</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            پیش‌رو
            {activeReservations.length > 0 && (
              <span className="mr-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {activeReservations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            تاریخچه
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/30 text-center py-8">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchReservations} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayReservations.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">📅</span>
            <h3 className="text-xl text-white mb-2">
              {activeTab === 'active' ? 'رزرو فعالی ندارید' : 'تاریخچه‌ای موجود نیست'}
            </h3>
            <p className="text-slate-400 mb-6">
              {activeTab === 'active'
                ? 'برای رزرو کلاس جدید به صفحه کلاس‌ها بروید'
                : 'هنوز رزروی انجام نداده‌اید'}
            </p>
            {activeTab === 'active' && (
              <Link to="/classes" className="btn btn-primary">
                مشاهده کلاس‌ها
              </Link>
            )}
          </div>
        )}

        {/* Reservations List */}
        {!isLoading && !error && displayReservations.length > 0 && (
          <div className="space-y-4">
            {displayReservations.map((reservation) => {
              const status = statusConfig[reservation.status] || {
                label: reservation.status,
                className: 'bg-slate-500/20 text-slate-400',
              }
              const canCancel =
                reservation.status === 'PENDING_PAYMENT' || reservation.status === 'PAID'

              return (
                <div key={reservation.id} className="card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                        📅
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          کد رزرو: <span className="text-slate-300 font-mono">#{reservation.id}</span>
                        </p>
                        <p className="text-slate-500 text-xs mt-1">رزرو شده در: {formatDateTime(reservation.bookedAt)}</p>
                        {reservation.checkedInAt && (
                          <p className="text-green-500 text-xs">ورود: {formatDateTime(reservation.checkedInAt)}</p>
                        )}
                        {reservation.cancelledAt && (
                          <p className="text-red-500 text-xs">
                            لغو شده: {formatDateTime(reservation.cancelledAt)}
                            {reservation.cancellationReason && ` - ${reservation.cancellationReason}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {canCancel && activeTab === 'active' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        disabled={cancellingId === reservation.id}
                        className="btn bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm disabled:opacity-50"
                      >
                        {cancellingId === reservation.id ? '...' : 'لغو رزرو'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}


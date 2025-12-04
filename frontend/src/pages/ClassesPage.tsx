import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { classesApi } from '../api/classes'
import { reservationsApi } from '../api/reservations'
import type { ClassSession } from '../types'

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper to get Persian day name
function getPersianDayName(date: Date): string {
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
  return days[date.getDay()]
}

// Helper to format Persian date display
function formatPersianDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'ژانویه',
    'فوریه',
    'مارس',
    'آوریل',
    'مه',
    'ژوئن',
    'ژوئیه',
    'اوت',
    'سپتامبر',
    'اکتبر',
    'نوامبر',
    'دسامبر',
  ]
  return `${date.getDate()} ${months[date.getMonth()]}`
}

export default function ClassesPage() {
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()))
  const [bookingSessionId, setBookingSessionId] = useState<number | null>(null)

  // Generate next 7 days for date picker
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: formatDate(date),
      label: i === 0 ? 'امروز' : i === 1 ? 'فردا' : getPersianDayName(date),
      subLabel: formatPersianDate(formatDate(date)),
    }
  })

  useEffect(() => {
    fetchSessions(selectedDate)
  }, [selectedDate])

  const fetchSessions = async (date: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await classesApi.getAvailableSessions(date)
      setSessions(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست کلاس‌ها')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookSession = async (sessionId: number) => {
    try {
      setBookingSessionId(sessionId)
      await reservationsApi.createReservation(sessionId)
      // Refresh sessions to update availability
      await fetchSessions(selectedDate)
      alert('رزرو با موفقیت انجام شد!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در رزرو کلاس')
    } finally {
      setBookingSessionId(null)
    }
  }

  // Group sessions by club
  const sessionsByClub = sessions.reduce(
    (acc, session) => {
      const clubName = session.clubName || 'نامشخص'
      if (!acc[clubName]) {
        acc[clubName] = []
      }
      acc[clubName].push(session)
      return acc
    },
    {} as Record<string, ClassSession[]>
  )

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
            <h1 className="text-xl font-bold text-white">کلاس‌ها</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Date Picker */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {dateOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDate(option.value)}
                className={`px-4 py-3 rounded-xl text-center transition-all min-w-[80px] ${
                  selectedDate === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs opacity-75">{option.subLabel}</div>
              </button>
            ))}
          </div>
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
            <button onClick={() => fetchSessions(selectedDate)} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sessions.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">📅</span>
            <h3 className="text-xl text-white mb-2">کلاسی یافت نشد</h3>
            <p className="text-slate-400">برای این روز کلاسی برنامه‌ریزی نشده است</p>
          </div>
        )}

        {/* Sessions by Club */}
        {!isLoading && !error && Object.keys(sessionsByClub).length > 0 && (
          <div className="space-y-8">
            {Object.entries(sessionsByClub).map(([clubName, clubSessions]) => (
              <div key={clubName}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    🏢
                  </div>
                  <h2 className="text-lg font-semibold text-white">{clubName}</h2>
                  <span className="text-slate-500 text-sm">({clubSessions.length} کلاس)</span>
                </div>

                <div className="space-y-3">
                  {clubSessions.map((session) => (
                    <div
                      key={session.id}
                      className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-primary-400 font-bold text-lg">
                          {session.activityName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{session.activityName}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {session.startTime} - {session.endTime}
                            </span>
                            {session.trainerName && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {session.trainerName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-left">
                          <div
                            className={`text-sm font-medium ${session.availableSpots > 0 ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {session.availableSpots > 0 ? `${session.availableSpots} جای خالی` : 'تکمیل شده'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {session.bookedCount} / {session.capacity} نفر
                          </div>
                        </div>
                        <button
                          onClick={() => handleBookSession(session.id)}
                          disabled={session.availableSpots === 0 || bookingSessionId === session.id}
                          className="btn btn-primary text-sm min-w-[70px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bookingSessionId === session.id ? '...' : 'رزرو'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


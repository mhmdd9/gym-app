import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import { classesApi } from '../api/classes'
import { reservationsApi } from '../api/reservations'
import type { Club, ClassSession } from '../types'

export default function ClubDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [club, setClub] = useState<Club | null>(null)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingSessionId, setBookingSessionId] = useState<number | null>(null)

  useEffect(() => {
    if (id) {
      fetchClubData(parseInt(id))
    }
  }, [id])

  const fetchClubData = async (clubId: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const [clubRes, sessionsRes] = await Promise.all([
        clubsApi.getClubById(clubId),
        classesApi.getClubSessions(clubId),
      ])

      setClub(clubRes.data.data)
      setSessions(sessionsRes.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت اطلاعات باشگاه')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookSession = async (sessionId: number) => {
    try {
      setBookingSessionId(sessionId)
      await reservationsApi.createReservation(sessionId)
      // Refresh sessions to update availability
      if (id) {
        const sessionsRes = await classesApi.getClubSessions(parseInt(id))
        setSessions(sessionsRes.data.data)
      }
      alert('رزرو با موفقیت انجام شد!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در رزرو کلاس')
    } finally {
      setBookingSessionId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center py-12">
          <span className="text-5xl mb-4 block">❌</span>
          <h3 className="text-xl text-white mb-2">خطا</h3>
          <p className="text-slate-400 mb-4">{error || 'باشگاه یافت نشد'}</p>
          <button onClick={() => navigate('/clubs')} className="btn btn-primary">
            بازگشت به لیست
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/clubs" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-white truncate">{club.name}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Club Info Card */}
        <div className="card mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-4xl flex-shrink-0">
              🏋️
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{club.name}</h2>
              {club.description && <p className="text-slate-400 mb-4">{club.description}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Address */}
                <div className="flex items-start gap-2 text-slate-400">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {club.city}، {club.address}
                  </span>
                </div>

                {/* Hours */}
                {club.openingTime && club.closingTime && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      ساعت کاری: {club.openingTime} - {club.closingTime}
                    </span>
                  </div>
                )}

                {/* Phone */}
                {club.phoneNumber && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a href={`tel:${club.phoneNumber}`} className="hover:text-primary-400 transition-colors">
                      {club.phoneNumber}
                    </a>
                  </div>
                )}

                {/* Email */}
                {club.email && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a href={`mailto:${club.email}`} className="hover:text-primary-400 transition-colors">
                      {club.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <h2 className="text-lg font-semibold text-white mb-4">کلاس‌های پیش‌رو</h2>

        {sessions.length === 0 ? (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">📅</span>
            <h3 className="text-xl text-white mb-2">کلاسی برنامه‌ریزی نشده</h3>
            <p className="text-slate-400">در حال حاضر کلاسی برای این باشگاه ثبت نشده است</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                    {session.activityName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{session.activityName}</h3>
                    <p className="text-slate-400 text-sm">
                      {session.trainerName && `${session.trainerName} • `}
                      {session.sessionDate} • {session.startTime} - {session.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm ${session.availableSpots > 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {session.availableSpots > 0 ? `${session.availableSpots} جای خالی` : 'تکمیل'}
                  </span>
                  <button
                    onClick={() => handleBookSession(session.id)}
                    disabled={session.availableSpots === 0 || bookingSessionId === session.id}
                    className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingSessionId === session.id ? '...' : 'رزرو'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


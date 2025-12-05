import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import { sessionsApi } from '../api/sessions'
import type { Club, ClassSession, Activity, Trainer, CreateClassSessionRequest } from '../types'

// Status display config
const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'برنامه‌ریزی شده', className: 'bg-blue-500/20 text-blue-400' },
  CANCELLED: { label: 'لغو شده', className: 'bg-red-500/20 text-red-400' },
  COMPLETED: { label: 'برگزار شده', className: 'bg-green-500/20 text-green-400' },
}

const emptyForm: Omit<CreateClassSessionRequest, 'clubId'> = {
  activityId: 0,
  trainerId: undefined,
  sessionDate: '',
  startTime: '08:00',
  endTime: '09:00',
  capacity: 20,
  notes: '',
}

export default function StaffSessionsPage() {
  // Clubs state
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Sessions state
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Activities & Trainers state
  const [activities, setActivities] = useState<Activity[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Load clubs on mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Load sessions when club changes
  useEffect(() => {
    if (selectedClubId) {
      fetchSessions(selectedClubId)
      fetchActivitiesAndTrainers(selectedClubId)
    }
  }, [selectedClubId])

  const fetchClubs = async () => {
    try {
      setIsLoadingClubs(true)
      const response = await clubsApi.getMyClubs()
      setClubs(response.data.data)
      if (response.data.data.length > 0) {
        setSelectedClubId(response.data.data[0].id)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست باشگاه‌ها')
    } finally {
      setIsLoadingClubs(false)
    }
  }

  const fetchSessions = async (clubId: number) => {
    try {
      setIsLoadingSessions(true)
      setError(null)
      const response = await sessionsApi.getClubSessionsForManagement(clubId)
      setSessions(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست کلاس‌ها')
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const fetchActivitiesAndTrainers = async (clubId: number) => {
    try {
      const [activitiesRes, trainersRes] = await Promise.all([
        sessionsApi.getClubActivities(clubId),
        sessionsApi.getClubTrainers(clubId),
      ])
      setActivities(activitiesRes.data.data)
      setTrainers(trainersRes.data.data)
    } catch (err) {
      console.error('Failed to fetch activities/trainers:', err)
    }
  }

  const openCreateModal = () => {
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    setFormData({
      ...emptyForm,
      sessionDate: dateStr,
      activityId: activities.length > 0 ? activities[0].id : 0,
      capacity: activities.length > 0 ? activities[0].defaultCapacity : 20,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData(emptyForm)
    setFormError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'activityId' || name === 'trainerId' || name === 'capacity' 
        ? (value ? Number(value) : undefined)
        : value,
    }))

    // Auto-set capacity and end time when activity changes
    if (name === 'activityId' && value) {
      const activity = activities.find((a) => a.id === Number(value))
      if (activity) {
        setFormData((prev) => ({
          ...prev,
          activityId: Number(value),
          capacity: activity.defaultCapacity,
          endTime: calculateEndTime(prev.startTime, activity.durationMinutes),
        }))
      }
    }

    // Auto-calculate end time when start time changes
    if (name === 'startTime') {
      const activity = activities.find((a) => a.id === formData.activityId)
      if (activity) {
        setFormData((prev) => ({
          ...prev,
          startTime: value,
          endTime: calculateEndTime(value, activity.durationMinutes),
        }))
      }
    }
  }

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedClubId) {
      setFormError('باشگاه انتخاب نشده است')
      return
    }
    if (!formData.activityId) {
      setFormError('فعالیت را انتخاب کنید')
      return
    }
    if (!formData.sessionDate) {
      setFormError('تاریخ کلاس الزامی است')
      return
    }

    try {
      setIsSaving(true)
      const response = await sessionsApi.createSession({
        ...formData,
        clubId: selectedClubId,
        trainerId: formData.trainerId || undefined,
      })
      setSessions((prev) => [...prev, response.data.data])
      closeModal()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'خطا در ایجاد کلاس')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async (session: ClassSession) => {
    if (!confirm(`آیا از لغو کلاس "${session.activityName}" مطمئن هستید؟`)) {
      return
    }

    try {
      await sessionsApi.cancelSession(session.id)
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: 'CANCELLED' as const } : s))
      )
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در لغو کلاس')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const selectedClub = clubs.find((c) => c.id === selectedClubId)

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
              <h1 className="text-xl font-bold text-white">مدیریت کلاس‌ها</h1>
            </div>
            <button
              onClick={openCreateModal}
              disabled={!selectedClubId || activities.length === 0}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              کلاس جدید
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Club Selector */}
        {!isLoadingClubs && clubs.length > 0 && (
          <div className="mb-6">
            <label className="block text-slate-400 text-sm mb-2">انتخاب باشگاه</label>
            <select
              value={selectedClubId || ''}
              onChange={(e) => setSelectedClubId(Number(e.target.value))}
              className="input-field w-full max-w-md"
            >
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} - {club.city}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Loading State */}
        {(isLoadingClubs || isLoadingSessions) && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* No Clubs State */}
        {!isLoadingClubs && clubs.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">🏢</span>
            <h3 className="text-xl text-white mb-2">باشگاهی یافت نشد</h3>
            <p className="text-slate-400 mb-6">ابتدا باید یک باشگاه ایجاد کنید</p>
            <Link to="/admin/clubs" className="btn btn-primary">
              ایجاد باشگاه
            </Link>
          </div>
        )}

        {/* No Activities Warning */}
        {selectedClubId && !isLoadingSessions && activities.length === 0 && (
          <div className="card bg-yellow-500/10 border-yellow-500/30 mb-6">
            <p className="text-yellow-400">
              ⚠️ هیچ فعالیتی برای این باشگاه تعریف نشده است. برای ایجاد کلاس ابتدا باید فعالیت‌ها را تعریف کنید.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/30 text-center py-8">
            <p className="text-red-400">{error}</p>
            <button onClick={() => selectedClubId && fetchSessions(selectedClubId)} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingSessions && !error && selectedClubId && sessions.length === 0 && activities.length > 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">📆</span>
            <h3 className="text-xl text-white mb-2">هنوز کلاسی برنامه‌ریزی نشده</h3>
            <p className="text-slate-400 mb-6">اولین کلاس خود را ایجاد کنید</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              ایجاد کلاس جدید
            </button>
          </div>
        )}

        {/* Sessions List */}
        {!isLoadingSessions && !error && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{session.activityName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[session.status]?.className || 'bg-slate-500/20 text-slate-400'}`}>
                        {statusConfig[session.status]?.label || session.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">تاریخ:</span>
                        <p className="text-slate-300">{formatDate(session.sessionDate)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">ساعت:</span>
                        <p className="text-slate-300" dir="ltr">
                          {session.startTime} - {session.endTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">مربی:</span>
                        <p className="text-slate-300">{session.trainerName || 'تعیین نشده'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">ظرفیت:</span>
                        <p className="text-slate-300">
                          {session.bookedCount} / {session.capacity}
                          <span className="text-slate-500 text-xs mr-1">
                            ({session.availableSpots} جای خالی)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {session.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCancel(session)}
                        className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30"
                        title="لغو کلاس"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">ایجاد کلاس جدید</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Club Info */}
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-400 text-sm">باشگاه:</span>
                <p className="text-white font-medium">{selectedClub?.name}</p>
              </div>

              {/* Activity */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  فعالیت <span className="text-red-400">*</span>
                </label>
                <select
                  name="activityId"
                  value={formData.activityId || ''}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="">انتخاب کنید...</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} ({activity.durationMinutes} دقیقه)
                    </option>
                  ))}
                </select>
              </div>

              {/* Trainer */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">مربی</label>
                <select
                  name="trainerId"
                  value={formData.trainerId || ''}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="">بدون مربی</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.fullName} {trainer.specialization ? `(${trainer.specialization})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  تاریخ <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="sessionDate"
                  value={formData.sessionDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field w-full"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    ساعت شروع <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    ساعت پایان <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  ظرفیت <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min={1}
                  className="input-field w-full"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">یادداشت</label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  className="input-field w-full h-20 resize-none"
                  placeholder="توضیحات اضافی..."
                  dir="rtl"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                  انصراف
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary flex-1 disabled:opacity-50">
                  {isSaving ? 'در حال ذخیره...' : 'ایجاد کلاس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

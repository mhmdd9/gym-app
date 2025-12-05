import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import { sessionsApi } from '../api/sessions'
import { schedulesApi } from '../api/schedules'
import PersianDatePicker from '../components/PersianDatePicker'
import { SearchableClubSelect } from '../components/SearchableClubSelect'
import type { Club, Activity, Trainer, Schedule, CreateScheduleRequest } from '../types'

// Days of week config
const daysOfWeek = [
  { value: 'SATURDAY', label: 'شنبه' },
  { value: 'SUNDAY', label: 'یکشنبه' },
  { value: 'MONDAY', label: 'دوشنبه' },
  { value: 'TUESDAY', label: 'سه‌شنبه' },
  { value: 'WEDNESDAY', label: 'چهارشنبه' },
  { value: 'THURSDAY', label: 'پنجشنبه' },
  { value: 'FRIDAY', label: 'جمعه' },
]

const getDayLabel = (day: string) => {
  return daysOfWeek.find((d) => d.value === day)?.label || day
}

const emptyForm: CreateScheduleRequest = {
  activityId: 0,
  trainerId: undefined,
  startTime: '08:00',
  endTime: '09:00',
  daysOfWeek: [],
  validFrom: '',
  validUntil: '',
  capacity: undefined,
  notes: '',
}

export default function AdminSchedulesPage() {
  // Clubs state
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Schedules state
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Activities & Trainers
  const [activities, setActivities] = useState<Activity[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState<CreateScheduleRequest>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Generate modal state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [generateStartDate, setGenerateStartDate] = useState('')
  const [generateEndDate, setGenerateEndDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Load clubs on mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Load schedules when club changes
  useEffect(() => {
    if (selectedClubId) {
      fetchSchedules(selectedClubId)
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

  const fetchSchedules = async (clubId: number) => {
    try {
      setIsLoadingSchedules(true)
      setError(null)
      const response = await schedulesApi.getAllClubSchedules(clubId)
      setSchedules(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست برنامه‌ها')
    } finally {
      setIsLoadingSchedules(false)
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
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    setEditingSchedule(null)
    setFormData({
      ...emptyForm,
      validFrom: dateStr,
      activityId: activities.length > 0 ? activities[0].id : 0,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      activityId: schedule.activityId,
      trainerId: schedule.trainerId || undefined,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      daysOfWeek: schedule.daysOfWeek,
      validFrom: schedule.validFrom,
      validUntil: schedule.validUntil || '',
      capacity: schedule.capacity || undefined,
      notes: schedule.notes || '',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSchedule(null)
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
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }))
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
    if (formData.daysOfWeek.length === 0) {
      setFormError('حداقل یک روز هفته را انتخاب کنید')
      return
    }
    if (!formData.validFrom) {
      setFormError('تاریخ شروع الزامی است')
      return
    }

    try {
      setIsSaving(true)
      if (editingSchedule) {
        const response = await schedulesApi.updateSchedule(editingSchedule.id, formData)
        setSchedules((prev) =>
          prev.map((s) => (s.id === editingSchedule.id ? response.data.data : s))
        )
      } else {
        const response = await schedulesApi.createSchedule(selectedClubId, formData)
        setSchedules((prev) => [...prev, response.data.data])
      }
      closeModal()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'خطا در ذخیره برنامه')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (schedule: Schedule) => {
    try {
      const response = await schedulesApi.toggleScheduleStatus(schedule.id)
      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? response.data.data : s))
      )
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در تغییر وضعیت برنامه')
    }
  }

  const handleDelete = async (schedule: Schedule) => {
    if (!confirm(`آیا از حذف این برنامه مطمئن هستید؟`)) {
      return
    }

    try {
      await schedulesApi.deleteSchedule(schedule.id)
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id))
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در حذف برنامه')
    }
  }

  const openGenerateModal = () => {
    const today = new Date()
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    setGenerateStartDate(today.toISOString().split('T')[0])
    setGenerateEndDate(nextMonth.toISOString().split('T')[0])
    setIsGenerateModalOpen(true)
  }

  const handleGenerate = async () => {
    if (!selectedClubId || !generateStartDate || !generateEndDate) return

    try {
      setIsGenerating(true)
      const response = await schedulesApi.generateSessions(selectedClubId, generateStartDate, generateEndDate)
      alert(`${response.data.data.sessionsCreated} جلسه با موفقیت ایجاد شد`)
      setIsGenerateModalOpen(false)
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در ایجاد جلسات')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fa-IR')
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
              <h1 className="text-xl font-bold text-white">مدیریت برنامه‌های تکراری</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openGenerateModal}
                disabled={!selectedClubId || schedules.length === 0}
                className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ایجاد جلسات
              </button>
              <button
                onClick={openCreateModal}
                disabled={!selectedClubId || activities.length === 0}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                برنامه جدید
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Club Selector */}
        {!isLoadingClubs && clubs.length > 0 && (
          <div className="mb-6">
            <SearchableClubSelect
              clubs={clubs}
              selectedClubId={selectedClubId}
              onSelect={(clubId) => setSelectedClubId(clubId)}
            />
          </div>
        )}

        {/* Loading State */}
        {(isLoadingClubs || isLoadingSchedules) && (
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
            <Link to="/admin/clubs" className="btn btn-primary">ایجاد باشگاه</Link>
          </div>
        )}

        {/* No Activities Warning */}
        {selectedClubId && !isLoadingSchedules && activities.length === 0 && (
          <div className="card bg-yellow-500/10 border-yellow-500/30 mb-6">
            <p className="text-yellow-400">
              ⚠️ هیچ فعالیتی برای این باشگاه تعریف نشده است. برای ایجاد برنامه ابتدا باید فعالیت‌ها را تعریف کنید.
            </p>
            <Link to="/admin/activities" className="text-yellow-400 underline text-sm mt-2 inline-block">
              رفتن به مدیریت فعالیت‌ها
            </Link>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/30 text-center py-8">
            <p className="text-red-400">{error}</p>
            <button onClick={() => selectedClubId && fetchSchedules(selectedClubId)} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingSchedules && !error && selectedClubId && schedules.length === 0 && activities.length > 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">📅</span>
            <h3 className="text-xl text-white mb-2">هنوز برنامه‌ای تعریف نشده</h3>
            <p className="text-slate-400 mb-6">برنامه‌های تکراری هفتگی را تعریف کنید تا جلسات به‌صورت خودکار ایجاد شوند</p>
            <button onClick={openCreateModal} className="btn btn-primary">ایجاد برنامه جدید</button>
          </div>
        )}

        {/* Schedules List */}
        {!isLoadingSchedules && !error && schedules.length > 0 && (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className={`card ${!schedule.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  {/* Schedule Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{schedule.activityName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        schedule.activityType === 'OPEN_GYM' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {schedule.activityType === 'OPEN_GYM' ? 'سالن آزاد' : 'کلاس'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        schedule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {schedule.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-slate-500">ساعت:</span>
                        <p className="text-slate-300" dir="ltr">{schedule.startTime} - {schedule.endTime}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">مربی:</span>
                        <p className="text-slate-300">{schedule.trainerName || 'تعیین نشده'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">ظرفیت:</span>
                        <p className="text-slate-300">{schedule.capacity || '-'} نفر</p>
                      </div>
                      <div>
                        <span className="text-slate-500">اعتبار:</span>
                        <p className="text-slate-300">
                          از {formatDate(schedule.validFrom)}
                          {schedule.validUntil && ` تا ${formatDate(schedule.validUntil)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {schedule.daysOfWeek.map((day) => (
                        <span key={day} className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 text-xs">
                          {getDayLabel(day)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="btn btn-secondary"
                      title="ویرایش"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(schedule)}
                      className={`btn ${
                        schedule.isActive
                          ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30'
                      }`}
                      title={schedule.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                    >
                      {schedule.isActive ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(schedule)}
                      className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30"
                      title="حذف"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingSchedule ? 'ویرایش برنامه' : 'ایجاد برنامه جدید'}
              </h2>
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
                      {activity.name} ({activity.activityType === 'OPEN_GYM' ? 'سالن آزاد' : 'کلاس'})
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

              {/* Days of Week */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  روزهای هفته <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.daysOfWeek.includes(day.value)
                          ? 'border-primary-500 bg-primary-500/10 text-white'
                          : 'border-slate-700 hover:border-slate-600 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.daysOfWeek.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                        className="sr-only"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Valid From/Until */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    شروع اعتبار <span className="text-red-400">*</span>
                  </label>
                  <PersianDatePicker
                    value={formData.validFrom}
                    onChange={(date) => setFormData((prev) => ({ ...prev, validFrom: date }))}
                    placeholder="انتخاب تاریخ"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">پایان اعتبار</label>
                  <PersianDatePicker
                    value={formData.validUntil || ''}
                    onChange={(date) => setFormData((prev) => ({ ...prev, validUntil: date }))}
                    placeholder="بدون محدودیت"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">ظرفیت</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleInputChange}
                  min={1}
                  className="input-field w-full"
                  placeholder="ظرفیت پیش‌فرض فعالیت"
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
                  {isSaving ? 'در حال ذخیره...' : editingSchedule ? 'ذخیره تغییرات' : 'ایجاد برنامه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Sessions Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">ایجاد جلسات از برنامه‌ها</h2>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-slate-400 mb-4">
              جلسات کلاس‌ها بر اساس برنامه‌های فعال برای بازه زمانی مشخص شده ایجاد می‌شوند.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">از تاریخ</label>
                <PersianDatePicker
                  value={generateStartDate}
                  onChange={setGenerateStartDate}
                  placeholder="انتخاب تاریخ"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">تا تاریخ</label>
                <PersianDatePicker
                  value={generateEndDate}
                  onChange={setGenerateEndDate}
                  placeholder="انتخاب تاریخ"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsGenerateModalOpen(false)} className="btn btn-secondary flex-1">
                انصراف
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !generateStartDate || !generateEndDate}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {isGenerating ? 'در حال ایجاد...' : 'ایجاد جلسات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

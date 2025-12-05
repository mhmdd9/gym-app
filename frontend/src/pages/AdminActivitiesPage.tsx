import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import { sessionsApi } from '../api/sessions'
import type { Club, Activity, CreateActivityRequest } from '../types'

// Intensity level config
const intensityConfig: Record<string, { label: string; className: string }> = {
  BEGINNER: { label: 'مبتدی', className: 'bg-green-500/20 text-green-400' },
  INTERMEDIATE: { label: 'متوسط', className: 'bg-yellow-500/20 text-yellow-400' },
  ADVANCED: { label: 'پیشرفته', className: 'bg-red-500/20 text-red-400' },
}

// Common categories
const categories = [
  'هوازی',
  'قدرتی',
  'ذهن و بدن',
  'رزمی',
  'آبی',
  'گروهی',
  'عمومی',
]

const emptyForm: CreateActivityRequest = {
  name: '',
  description: '',
  durationMinutes: 60,
  defaultCapacity: 20,
  intensityLevel: '',
  category: '',
}

export default function AdminActivitiesPage() {
  // Clubs state
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [formData, setFormData] = useState<CreateActivityRequest>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Load clubs on mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Load activities when club changes
  useEffect(() => {
    if (selectedClubId) {
      fetchActivities(selectedClubId)
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

  const fetchActivities = async (clubId: number) => {
    try {
      setIsLoadingActivities(true)
      setError(null)
      const response = await sessionsApi.getAllClubActivities(clubId)
      setActivities(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست فعالیت‌ها')
    } finally {
      setIsLoadingActivities(false)
    }
  }

  const openCreateModal = () => {
    setEditingActivity(null)
    setFormData(emptyForm)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity)
    setFormData({
      name: activity.name,
      description: activity.description || '',
      durationMinutes: activity.durationMinutes,
      defaultCapacity: activity.defaultCapacity,
      intensityLevel: activity.intensityLevel || '',
      category: activity.category || '',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingActivity(null)
    setFormData(emptyForm)
    setFormError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationMinutes' || name === 'defaultCapacity' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedClubId) {
      setFormError('باشگاه انتخاب نشده است')
      return
    }
    if (!formData.name.trim()) {
      setFormError('نام فعالیت الزامی است')
      return
    }

    try {
      setIsSaving(true)
      if (editingActivity) {
        const response = await sessionsApi.updateActivity(selectedClubId, editingActivity.id, formData)
        setActivities((prev) =>
          prev.map((a) => (a.id === editingActivity.id ? response.data.data : a))
        )
      } else {
        const response = await sessionsApi.createActivity(selectedClubId, formData)
        setActivities((prev) => [...prev, response.data.data])
      }
      closeModal()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'خطا در ذخیره فعالیت')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (activity: Activity) => {
    if (!selectedClubId) return

    try {
      const response = await sessionsApi.toggleActivityStatus(selectedClubId, activity.id)
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? response.data.data : a))
      )
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در تغییر وضعیت فعالیت')
    }
  }

  const handleDelete = async (activity: Activity) => {
    if (!selectedClubId) return
    if (!confirm(`آیا از حذف فعالیت "${activity.name}" مطمئن هستید؟`)) {
      return
    }

    try {
      await sessionsApi.deleteActivity(selectedClubId, activity.id)
      setActivities((prev) => prev.filter((a) => a.id !== activity.id))
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در حذف فعالیت')
    }
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
              <h1 className="text-xl font-bold text-white">مدیریت فعالیت‌ها</h1>
            </div>
            <button
              onClick={openCreateModal}
              disabled={!selectedClubId}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              فعالیت جدید
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
        {(isLoadingClubs || isLoadingActivities) && (
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

        {/* Error State */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/30 text-center py-8">
            <p className="text-red-400">{error}</p>
            <button onClick={() => selectedClubId && fetchActivities(selectedClubId)} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingActivities && !error && selectedClubId && activities.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">🏃</span>
            <h3 className="text-xl text-white mb-2">هنوز فعالیتی تعریف نشده</h3>
            <p className="text-slate-400 mb-6">فعالیت‌های ورزشی باشگاه خود را تعریف کنید</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              ایجاد فعالیت جدید
            </button>
          </div>
        )}

        {/* Activities Grid */}
        {!isLoadingActivities && !error && activities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`card ${!activity.isActive ? 'opacity-60' : ''}`}
              >
                {/* Activity Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{activity.name}</h3>
                    {activity.category && (
                      <p className="text-slate-400 text-sm">{activity.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.intensityLevel && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          intensityConfig[activity.intensityLevel]?.className || 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {intensityConfig[activity.intensityLevel]?.label || activity.intensityLevel}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {activity.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                </div>

                {/* Activity Info */}
                <div className="space-y-2 mb-4 text-sm">
                  {activity.description && (
                    <p className="text-slate-400 line-clamp-2">{activity.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {activity.durationMinutes} دقیقه
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {activity.defaultCapacity} نفر
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => openEditModal(activity)}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleToggleStatus(activity)}
                    className={`btn ${
                      activity.isActive
                        ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30'
                    }`}
                    title={activity.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                  >
                    {activity.isActive ? (
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
                    onClick={() => handleDelete(activity)}
                    className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30"
                    title="حذف"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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
                {editingActivity ? 'ویرایش فعالیت' : 'ایجاد فعالیت جدید'}
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

              {/* Name */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  نام فعالیت <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="مثال: یوگا، بدنسازی، ایروبیک"
                  dir="rtl"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">توضیحات</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="input-field w-full h-20 resize-none"
                  placeholder="توضیحات مختصری درباره فعالیت..."
                  dir="rtl"
                />
              </div>

              {/* Duration & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    مدت (دقیقه) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    min={5}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    ظرفیت پیش‌فرض <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="defaultCapacity"
                    value={formData.defaultCapacity}
                    onChange={handleInputChange}
                    min={1}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Intensity & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">سطح سختی</label>
                  <select
                    name="intensityLevel"
                    value={formData.intensityLevel || ''}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="">انتخاب کنید...</option>
                    <option value="BEGINNER">مبتدی</option>
                    <option value="INTERMEDIATE">متوسط</option>
                    <option value="ADVANCED">پیشرفته</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">دسته‌بندی</label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="">انتخاب کنید...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {isSaving ? 'در حال ذخیره...' : editingActivity ? 'ذخیره تغییرات' : 'ایجاد فعالیت'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

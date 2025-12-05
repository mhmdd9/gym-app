import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import type { Club } from '../types'

interface ClubFormData {
  name: string
  description: string
  address: string
  city: string
  phoneNumber: string
  email: string
  openingTime: string
  closingTime: string
}

const emptyForm: ClubFormData = {
  name: '',
  description: '',
  address: '',
  city: '',
  phoneNumber: '',
  email: '',
  openingTime: '06:00',
  closingTime: '22:00',
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [formData, setFormData] = useState<ClubFormData>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await clubsApi.getMyClubs()
      setClubs(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست باشگاه‌ها')
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingClub(null)
    setFormData(emptyForm)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (club: Club) => {
    setEditingClub(club)
    setFormData({
      name: club.name,
      description: club.description || '',
      address: club.address,
      city: club.city,
      phoneNumber: club.phoneNumber || '',
      email: club.email || '',
      openingTime: club.openingTime || '06:00',
      closingTime: club.closingTime || '22:00',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingClub(null)
    setFormData(emptyForm)
    setFormError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validation
    if (!formData.name.trim()) {
      setFormError('نام باشگاه الزامی است')
      return
    }
    if (!formData.address.trim()) {
      setFormError('آدرس باشگاه الزامی است')
      return
    }
    if (!formData.city.trim()) {
      setFormError('شهر الزامی است')
      return
    }

    try {
      setIsSaving(true)
      const clubData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        email: formData.email.trim() || undefined,
        openingTime: formData.openingTime || undefined,
        closingTime: formData.closingTime || undefined,
      }

      if (editingClub) {
        const response = await clubsApi.updateClub(editingClub.id, clubData)
        setClubs((prev) => prev.map((c) => (c.id === editingClub.id ? response.data.data : c)))
      } else {
        const response = await clubsApi.createClub(clubData)
        setClubs((prev) => [...prev, response.data.data])
      }
      closeModal()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'خطا در ذخیره اطلاعات')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (club: Club) => {
    if (!confirm(`آیا از حذف باشگاه "${club.name}" مطمئن هستید؟`)) {
      return
    }

    try {
      await clubsApi.deleteClub(club.id)
      setClubs((prev) => prev.filter((c) => c.id !== club.id))
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در حذف باشگاه')
    }
  }

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
              <h1 className="text-xl font-bold text-white">مدیریت باشگاه‌ها</h1>
              <span className="text-slate-400 text-sm">({clubs.length} باشگاه)</span>
            </div>
            <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              باشگاه جدید
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
            <button onClick={fetchClubs} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && clubs.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">🏢</span>
            <h3 className="text-xl text-white mb-2">هنوز باشگاهی ثبت نشده</h3>
            <p className="text-slate-400 mb-6">اولین باشگاه خود را ایجاد کنید</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              ایجاد باشگاه جدید
            </button>
          </div>
        )}

        {/* Clubs Grid */}
        {!isLoading && !error && clubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div key={club.id} className="card">
                {/* Club Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-2xl">
                      🏋️
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{club.name}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        {club.city}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      club.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {club.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                {/* Club Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-slate-400 line-clamp-2">{club.description || 'بدون توضیحات'}</p>
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {club.openingTime && club.closingTime
                      ? `${club.openingTime} - ${club.closingTime}`
                      : 'ساعت کاری تعیین نشده'}
                  </div>
                  {club.phoneNumber && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span dir="ltr">{club.phoneNumber}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => openEditModal(club)}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(club)}
                    className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <Link
                    to={`/clubs/${club.id}`}
                    className="btn bg-slate-700/50 text-slate-300 hover:bg-slate-700 border-slate-600/50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Link>
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
                {editingClub ? 'ویرایش باشگاه' : 'ایجاد باشگاه جدید'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  نام باشگاه <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="مثال: باشگاه ورزشی آریا"
                  dir="rtl"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">توضیحات</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field w-full h-24 resize-none"
                  placeholder="توضیحات مختصری درباره باشگاه..."
                  dir="rtl"
                />
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    شهر <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="تهران"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    آدرس <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="خیابان ولیعصر..."
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">تلفن</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="021-12345678"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">ایمیل</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="info@club.com"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Opening Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">ساعت شروع کار</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">ساعت پایان کار</label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
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
                  {isSaving ? 'در حال ذخیره...' : editingClub ? 'ذخیره تغییرات' : 'ایجاد باشگاه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

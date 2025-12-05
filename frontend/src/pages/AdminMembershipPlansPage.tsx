import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import { sessionsApi } from '../api/sessions'
import * as membershipsApi from '../api/memberships'
import { SearchableClubSelect } from '../components/SearchableClubSelect'
import type { Club, Activity, MembershipPlan, CreateMembershipPlanRequest, UserMembership } from '../types'

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

// Membership status config
const membershipStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'در انتظار پرداخت', className: 'bg-orange-500/20 text-orange-400' },
  ACTIVE: { label: 'فعال', className: 'bg-green-500/20 text-green-400' },
  EXPIRED: { label: 'منقضی', className: 'bg-red-500/20 text-red-400' },
  SUSPENDED: { label: 'معلق', className: 'bg-yellow-500/20 text-yellow-400' },
  CANCELLED: { label: 'لغو شده', className: 'bg-slate-500/20 text-slate-400' },
}

const emptyForm: CreateMembershipPlanRequest = {
  activityId: undefined,
  name: '',
  description: '',
  durationDays: 30,
  price: 0,
}

export default function AdminMembershipPlansPage() {
  // Clubs state
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([])

  // Plans state
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null)
  const [formData, setFormData] = useState<CreateMembershipPlanRequest>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Members modal state
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [selectedPlanForMembers, setSelectedPlanForMembers] = useState<MembershipPlan | null>(null)
  const [planMembers, setPlanMembers] = useState<UserMembership[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  // Load clubs on mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Load plans and activities when club changes
  useEffect(() => {
    if (selectedClubId) {
      fetchPlans(selectedClubId)
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

  const fetchPlans = async (clubId: number) => {
    try {
      setIsLoadingPlans(true)
      setError(null)
      const response = await membershipsApi.getAllMembershipPlans(clubId)
      setPlans(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست اشتراک‌ها')
    } finally {
      setIsLoadingPlans(false)
    }
  }

  const fetchActivities = async (clubId: number) => {
    try {
      const response = await sessionsApi.getAllClubActivities(clubId)
      setActivities(response.data.data)
    } catch (err: any) {
      console.error('Error fetching activities:', err)
    }
  }

  const openCreateModal = () => {
    setEditingPlan(null)
    setFormData(emptyForm)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan)
    setFormData({
      activityId: plan.activityId,
      name: plan.name,
      description: plan.description || '',
      durationDays: plan.durationDays,
      price: plan.price,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPlan(null)
    setFormData(emptyForm)
    setFormError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev }
      if (name === 'durationDays' || name === 'price') {
        ;(newData as any)[name] = value ? Number(value) : undefined
      } else if (name === 'activityId') {
        ;(newData as any)[name] = value ? Number(value) : undefined
      } else {
        ;(newData as any)[name] = value
      }
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedClubId) {
      setFormError('باشگاه انتخاب نشده است')
      return
    }
    if (!formData.name.trim()) {
      setFormError('نام اشتراک الزامی است')
      return
    }
    if (!formData.price || formData.price <= 0) {
      setFormError('قیمت باید بیشتر از صفر باشد')
      return
    }

    try {
      setIsSaving(true)
      if (editingPlan) {
        const response = await membershipsApi.updateMembershipPlan(selectedClubId, editingPlan.id, formData)
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? response.data : p)))
      } else {
        const response = await membershipsApi.createMembershipPlan(selectedClubId, formData)
        setPlans((prev) => [...prev, response.data])
      }
      closeModal()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'خطا در ذخیره اشتراک')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (plan: MembershipPlan) => {
    if (!selectedClubId) return

    try {
      await membershipsApi.toggleMembershipPlanStatus(selectedClubId, plan.id)
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p)))
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در تغییر وضعیت اشتراک')
    }
  }

  const handleDelete = async (plan: MembershipPlan) => {
    if (!selectedClubId) return
    if (!confirm(`آیا از حذف اشتراک "${plan.name}" مطمئن هستید؟`)) {
      return
    }

    try {
      await membershipsApi.deleteMembershipPlan(selectedClubId, plan.id)
      setPlans((prev) => prev.filter((p) => p.id !== plan.id))
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در حذف اشتراک')
    }
  }

  const openMembersModal = async (plan: MembershipPlan) => {
    setSelectedPlanForMembers(plan)
    setIsMembersModalOpen(true)
    setPlanMembers([])

    try {
      setIsLoadingMembers(true)
      const response = await membershipsApi.getMembershipsByPlan(plan.id)
      setPlanMembers(response.data)
    } catch (err: any) {
      console.error('Error fetching plan members:', err)
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const closeMembersModal = () => {
    setIsMembersModalOpen(false)
    setSelectedPlanForMembers(null)
    setPlanMembers([])
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fa-IR')
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
              <h1 className="text-xl font-bold text-white">مدیریت اشتراک‌ها</h1>
            </div>
            <button
              onClick={openCreateModal}
              disabled={!selectedClubId}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              اشتراک جدید
            </button>
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
        {(isLoadingClubs || isLoadingPlans) && (
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
            <button onClick={() => selectedClubId && fetchPlans(selectedClubId)} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingPlans && !error && selectedClubId && plans.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">💳</span>
            <h3 className="text-xl text-white mb-2">هنوز اشتراکی تعریف نشده</h3>
            <p className="text-slate-400 mb-6">اشتراک‌های باشگاه خود را تعریف کنید</p>
            <button onClick={openCreateModal} className="btn btn-primary">
              ایجاد اشتراک جدید
            </button>
          </div>
        )}

        {/* Plans Grid */}
        {!isLoadingPlans && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`card ${!plan.isActive ? 'opacity-60' : ''}`}>
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    {plan.activityName && <p className="text-slate-400 text-sm">{plan.activityName}</p>}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {plan.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                {/* Plan Info */}
                <div className="space-y-2 mb-4 text-sm">
                  {plan.description && <p className="text-slate-400 line-clamp-2">{plan.description}</p>}

                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {plan.durationDays} روز
                    </span>
                  </div>

                  <div className="text-xl font-bold text-primary-400">{formatPrice(plan.price)}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => openMembersModal(plan)}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                    title="مشاهده اعضا"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    اعضا
                  </button>
                  <button
                    onClick={() => openEditModal(plan)}
                    className="btn btn-secondary flex items-center justify-center gap-2"
                    title="ویرایش"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className={`btn ${
                      plan.isActive
                        ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30'
                    }`}
                    title={plan.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                  >
                    {plan.isActive ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30"
                    title="حذف"
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
                {editingPlan ? 'ویرایش اشتراک' : 'ایجاد اشتراک جدید'}
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
                  نام اشتراک <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="مثال: اشتراک ماهانه بدنسازی"
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
                  placeholder="توضیحات مختصری درباره اشتراک..."
                  dir="rtl"
                />
              </div>

              {/* Activity (optional) */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">فعالیت مربوطه (اختیاری)</label>
                <select
                  name="activityId"
                  value={formData.activityId || ''}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="">عمومی (همه فعالیت‌ها)</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">
                  اگر فعالیت خاصی انتخاب نشود، این اشتراک برای همه فعالیت‌ها معتبر است
                </p>
              </div>

              {/* Duration Days */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  مدت اعتبار (روز) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="durationDays"
                  value={formData.durationDays || ''}
                  onChange={handleInputChange}
                  min={1}
                  className="input-field w-full"
                  placeholder="30"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  قیمت (تومان) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  min={0}
                  step={1000}
                  className="input-field w-full"
                  placeholder="500000"
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
                  {isSaving ? 'در حال ذخیره...' : editingPlan ? 'ذخیره تغییرات' : 'ایجاد اشتراک'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {isMembersModalOpen && selectedPlanForMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">اعضای اشتراک</h2>
                <p className="text-slate-400 text-sm">{selectedPlanForMembers.name}</p>
              </div>
              <button onClick={closeMembersModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Loading */}
            {isLoadingMembers && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingMembers && planMembers.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">👤</span>
                <h3 className="text-lg text-white mb-2">هنوز عضوی ندارد</h3>
                <p className="text-slate-400">هنوز کسی این اشتراک را خریداری نکرده است</p>
              </div>
            )}

            {/* Members List */}
            {!isLoadingMembers && planMembers.length > 0 && (
              <div className="overflow-auto flex-1">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-right text-slate-300 font-medium">کاربر</th>
                      <th className="px-4 py-3 text-right text-slate-300 font-medium">تاریخ شروع</th>
                      <th className="px-4 py-3 text-right text-slate-300 font-medium">تاریخ پایان</th>
                      <th className="px-4 py-3 text-right text-slate-300 font-medium">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {planMembers.map((membership) => (
                      <tr key={membership.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                              {membership.userName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-white">{membership.userName || `کاربر #${membership.userId}`}</p>
                              <p className="text-slate-500 text-xs" dir="ltr">{membership.userPhone || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {formatDate(membership.startDate)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {formatDate(membership.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            membershipStatusConfig[membership.status]?.className || 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {membershipStatusConfig[membership.status]?.label || membership.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            {!isLoadingMembers && planMembers.length > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-700/50 flex justify-between items-center">
                <p className="text-slate-400 text-sm">
                  مجموع: {planMembers.length} عضو
                </p>
                <button onClick={closeMembersModal} className="btn btn-secondary">
                  بستن
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

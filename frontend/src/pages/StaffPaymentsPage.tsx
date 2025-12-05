import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import { paymentsApi, type PaymentHistoryParams } from '../api/payments'
import * as membershipsApi from '../api/memberships'
import { SearchableClubSelect } from '../components/SearchableClubSelect'
import { usePermission } from '../hooks/usePermission'
import type { Club, PendingPayment, RecordPaymentRequest, UserMembership, PaymentHistory, PageResponse } from '../types'

// Payment method config
const paymentMethods: { value: RecordPaymentRequest['method']; label: string }[] = [
  { value: 'CASH', label: 'نقدی' },
  { value: 'CARD', label: 'کارت بانکی' },
  { value: 'POS', label: 'دستگاه کارتخوان' },
  { value: 'BANK_TRANSFER', label: 'انتقال بانکی' },
]

// Default session price (can be configured per club/activity later)
const DEFAULT_SESSION_PRICE = 150000 // 150,000 IRR

// Payment method labels
const paymentMethodLabels: Record<string, string> = {
  CASH: 'نقدی',
  CARD: 'کارت بانکی',
  POS: 'کارتخوان',
  BANK_TRANSFER: 'انتقال بانکی',
}

// Payment status config
const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'در انتظار', className: 'bg-yellow-500/20 text-yellow-400' },
  PAID: { label: 'پرداخت شده', className: 'bg-green-500/20 text-green-400' },
  REFUNDED: { label: 'بازگشت داده شده', className: 'bg-blue-500/20 text-blue-400' },
  FAILED: { label: 'ناموفق', className: 'bg-red-500/20 text-red-400' },
}

// Payment type labels
const paymentTypeLabels: Record<string, string> = {
  MEMBERSHIP: 'اشتراک',
  RESERVATION: 'رزرو',
}

export default function StaffPaymentsPage() {
  const { canManageClubs } = usePermission() // Check if user is admin/owner

  // Clubs state
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Pending payments state (reservations)
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pending memberships state
  const [pendingMemberships, setPendingMemberships] = useState<UserMembership[]>([])
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false)

  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [historyPage, setHistoryPage] = useState<PageResponse<PaymentHistory> | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historySearch, setHistorySearch] = useState('')
  const [historyCurrentPage, setHistoryCurrentPage] = useState(0)

  // Active tab
  const [activeTab, setActiveTab] = useState<'memberships' | 'reservations' | 'history'>('memberships')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [formData, setFormData] = useState<Omit<RecordPaymentRequest, 'reservationId'>>({
    amount: DEFAULT_SESSION_PRICE,
    method: 'CASH',
    referenceNumber: '',
    notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Membership approval modal state
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState<UserMembership | null>(null)
  const [membershipFormData, setMembershipFormData] = useState({
    amount: 0,
    method: 'CASH' as RecordPaymentRequest['method'],
    referenceNumber: '',
    notes: '',
  })
  const [isApprovingMembership, setIsApprovingMembership] = useState(false)
  const [membershipFormError, setMembershipFormError] = useState<string | null>(null)

  // Fetch functions
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

  const fetchPendingPayments = async (clubId: number) => {
    try {
      setIsLoadingPayments(true)
      setError(null)
      const response = await paymentsApi.getPendingPayments(clubId)
      setPendingPayments(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست پرداخت‌های معلق')
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const fetchPendingMemberships = async (clubId: number) => {
    try {
      setIsLoadingMemberships(true)
      const response = await membershipsApi.getPendingMemberships(clubId)
      setPendingMemberships(response.data)
    } catch (err: any) {
      console.error('Error fetching pending memberships:', err)
    } finally {
      setIsLoadingMemberships(false)
    }
  }

  const fetchPaymentHistory = useCallback(async (clubId: number, params?: PaymentHistoryParams) => {
    try {
      setIsLoadingHistory(true)
      const response = await paymentsApi.getPaymentHistory(clubId, params)
      setPaymentHistory(response.data.data.content)
      setHistoryPage(response.data.data)
    } catch (err: any) {
      console.error('Error fetching payment history:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  // Load clubs on mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Load pending data when club changes
  useEffect(() => {
    if (selectedClubId) {
      fetchPendingPayments(selectedClubId)
      fetchPendingMemberships(selectedClubId)
    }
  }, [selectedClubId])

  // Load history when tab changes to history or page/search changes
  useEffect(() => {
    if (selectedClubId && activeTab === 'history' && canManageClubs) {
      fetchPaymentHistory(selectedClubId, {
        search: historySearch,
        page: historyCurrentPage,
      })
    }
  }, [selectedClubId, activeTab, historyCurrentPage, fetchPaymentHistory, canManageClubs])

  // Debounced search for history
  useEffect(() => {
    if (activeTab !== 'history' || !selectedClubId || !canManageClubs) return
    
    const timeoutId = setTimeout(() => {
      setHistoryCurrentPage(0)
      fetchPaymentHistory(selectedClubId, { search: historySearch, page: 0 })
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [historySearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const openPaymentModal = (payment: PendingPayment) => {
    setSelectedPayment(payment)
    setFormData({
      amount: DEFAULT_SESSION_PRICE,
      method: 'CASH',
      referenceNumber: '',
      notes: '',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPayment(null)
    setFormError(null)
  }

  const openMembershipModal = (membership: UserMembership) => {
    setSelectedMembership(membership)
    setMembershipFormData({
      amount: 0,
      method: 'CASH',
      referenceNumber: '',
      notes: '',
    })
    setMembershipFormError(null)
    setIsMembershipModalOpen(true)
  }

  const closeMembershipModal = () => {
    setIsMembershipModalOpen(false)
    setSelectedMembership(null)
    setMembershipFormError(null)
  }

  const handleMembershipInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMembershipFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }))
  }

  const handleApproveMembership = async (e: React.FormEvent) => {
    e.preventDefault()
    setMembershipFormError(null)

    if (!selectedMembership) return

    if (membershipFormData.amount <= 0) {
      setMembershipFormError('مبلغ باید بیشتر از صفر باشد')
      return
    }

    try {
      setIsApprovingMembership(true)
      await membershipsApi.approveMembership(selectedMembership.id, {
        amount: membershipFormData.amount,
        method: membershipFormData.method,
        referenceNumber: membershipFormData.referenceNumber || undefined,
        notes: membershipFormData.notes || undefined,
      })
      
      // Remove from list
      setPendingMemberships((prev) => 
        prev.filter((m) => m.id !== selectedMembership.id)
      )
      closeMembershipModal()
    } catch (err: any) {
      setMembershipFormError(err.response?.data?.message || 'خطا در تایید اشتراک')
    } finally {
      setIsApprovingMembership(false)
    }
  }

  const handleRejectMembership = async (membershipId: number) => {
    if (!confirm('آیا از رد این درخواست اشتراک مطمئن هستید؟')) return

    try {
      await membershipsApi.rejectMembership(membershipId, 'رد شده توسط مدیریت')
      setPendingMemberships((prev) => prev.filter((m) => m.id !== membershipId))
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در رد درخواست')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedPayment) return

    if (formData.amount <= 0) {
      setFormError('مبلغ باید بیشتر از صفر باشد')
      return
    }

    try {
      setIsSaving(true)
      await paymentsApi.recordPayment({
        reservationId: selectedPayment.reservationId,
        ...formData,
      })
      
      // Remove from list
      setPendingPayments((prev) => 
        prev.filter((p) => p.reservationId !== selectedPayment.reservationId)
      )
      closeModal()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'خطا در ثبت پرداخت')
    } finally {
      setIsSaving(false)
    }
  }

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // Format time
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-'
    return timeStr.substring(0, 5)
  }

  // Format datetime
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال'
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
              <h1 className="text-xl font-bold text-white">ثبت پرداخت</h1>
            </div>
            <button
              onClick={() => selectedClubId && fetchPendingPayments(selectedClubId)}
              disabled={!selectedClubId || isLoadingPayments}
              className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              بروزرسانی
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

        {/* Tabs */}
        {selectedClubId && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('memberships')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'memberships'
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>💳</span>
              درخواست‌های اشتراک
              {pendingMemberships.length > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingMemberships.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'reservations'
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>📅</span>
              پرداخت رزروها
              {pendingPayments.length > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingPayments.length}
                </span>
              )}
            </button>
            {canManageClubs && (
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>📊</span>
                تاریخچه پرداخت‌ها
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {(isLoadingClubs || isLoadingPayments || isLoadingMemberships) && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* No Clubs State */}
        {!isLoadingClubs && clubs.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">🏢</span>
            <h3 className="text-xl text-white mb-2">باشگاهی یافت نشد</h3>
            <p className="text-slate-400 mb-6">شما به هیچ باشگاهی دسترسی ندارید</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/30 text-center py-8">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => selectedClubId && fetchPendingPayments(selectedClubId)}
              className="btn btn-primary mt-4"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* MEMBERSHIPS TAB */}
        {activeTab === 'memberships' && (
          <>
            {/* Empty State */}
            {!isLoadingMemberships && selectedClubId && pendingMemberships.length === 0 && (
              <div className="card text-center py-12">
                <span className="text-5xl mb-4 block">✅</span>
                <h3 className="text-xl text-white mb-2">درخواست اشتراک جدیدی نیست!</h3>
                <p className="text-slate-400">در حال حاضر هیچ درخواست اشتراکی در انتظار تایید نیست</p>
              </div>
            )}

            {/* Pending Memberships List */}
            {!isLoadingMemberships && pendingMemberships.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    درخواست‌های اشتراک در انتظار تایید ({pendingMemberships.length})
                  </h2>
                </div>

                <div className="grid gap-4">
                  {pendingMemberships.map((membership) => (
                    <div key={membership.id} className="card border-orange-500/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                            {membership.userName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">
                              {membership.userName || `کاربر #${membership.userId}`}
                            </h3>
                            <p className="text-slate-400 text-sm" dir="ltr">
                              {membership.userPhone || '-'}
                            </p>
                          </div>
                        </div>

                        {/* Plan Info */}
                        <div className="flex-1 text-center">
                          <p className="text-white font-medium">{membership.planName || `پلن #${membership.planId}`}</p>
                          <p className="text-slate-400 text-sm">
                            شروع: {new Date(membership.startDate).toLocaleDateString('fa-IR')}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500/20 text-orange-400">
                            در انتظار پرداخت
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openMembershipModal(membership)}
                            className="btn btn-primary flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            تایید و فعال‌سازی
                          </button>
                          <button
                            onClick={() => handleRejectMembership(membership.id)}
                            className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30"
                            title="رد درخواست"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* RESERVATIONS TAB */}
        {activeTab === 'reservations' && (
          <>
            {/* Empty State */}
            {!isLoadingPayments && !error && selectedClubId && pendingPayments.length === 0 && (
              <div className="card text-center py-12">
                <span className="text-5xl mb-4 block">✅</span>
                <h3 className="text-xl text-white mb-2">همه پرداخت‌ها انجام شده!</h3>
                <p className="text-slate-400">در حال حاضر هیچ پرداخت معلقی وجود ندارد</p>
              </div>
            )}

            {/* Pending Payments List */}
            {!isLoadingPayments && !error && pendingPayments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                پرداخت‌های معلق ({pendingPayments.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {pendingPayments.map((payment) => (
                <div key={payment.reservationId} className="card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                        {payment.userFullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {payment.userFullName || 'کاربر بدون نام'}
                        </h3>
                        <p className="text-slate-400 text-sm" dir="ltr">
                          {payment.userPhoneNumber}
                        </p>
                      </div>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 text-center">
                      <p className="text-white font-medium">{payment.activityName || 'کلاس'}</p>
                      <p className="text-slate-400 text-sm">
                        {formatDate(payment.sessionDate)} - {formatTime(payment.startTime)}
                        {payment.trainerName && ` - ${payment.trainerName}`}
                      </p>
                    </div>

                    {/* Booking Info */}
                    <div className="text-left md:text-right">
                      <p className="text-slate-400 text-xs">رزرو شده در:</p>
                      <p className="text-slate-300 text-sm">{formatDateTime(payment.bookedAt)}</p>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => openPaymentModal(payment)}
                      className="btn btn-primary flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      ثبت پرداخت
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && canManageClubs && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-white">تاریخچه پرداخت‌ها</h2>
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="جستجو..."
                    className="input-field w-full sm:w-64 pr-10"
                    dir="rtl"
                  />
                  <svg
                    className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoadingHistory && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingHistory && paymentHistory.length === 0 && (
              <div className="card text-center py-12">
                <span className="text-5xl mb-4 block">📊</span>
                <h3 className="text-xl text-white mb-2">پرداختی یافت نشد</h3>
                <p className="text-slate-400">
                  {historySearch ? 'جستجوی شما نتیجه‌ای نداشت' : 'هنوز پرداختی ثبت نشده است'}
                </p>
              </div>
            )}

            {/* Payments Table */}
            {!isLoadingHistory && paymentHistory.length > 0 && (
              <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-right text-slate-300 font-medium">کاربر</th>
                        <th className="px-4 py-3 text-right text-slate-300 font-medium">نوع</th>
                        <th className="px-4 py-3 text-right text-slate-300 font-medium">جزئیات</th>
                        <th className="px-4 py-3 text-right text-slate-300 font-medium">مبلغ</th>
                        <th className="px-4 py-3 text-right text-slate-300 font-medium">روش</th>
                        <th className="px-4 py-3 text-right text-slate-300 font-medium">وضعیت</th>
                        <th className="px-4 py-3 text-right text-slate-300 font-medium">تاریخ</th>
                        <th className="px-4 py-3 text-right text-slate-300 font-medium">ثبت کننده</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                                {payment.userFullName?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-white text-sm">{payment.userFullName || '-'}</p>
                                <p className="text-slate-500 text-xs" dir="ltr">{payment.userPhone || '-'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              payment.paymentType === 'MEMBERSHIP' 
                                ? 'bg-purple-500/20 text-purple-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {paymentTypeLabels[payment.paymentType] || payment.paymentType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {payment.planName || payment.activityName || '-'}
                          </td>
                          <td className="px-4 py-3 text-white font-medium" dir="ltr">
                            {formatPrice(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {paymentMethodLabels[payment.method] || payment.method}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              paymentStatusConfig[payment.status]?.className || 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {paymentStatusConfig[payment.status]?.label || payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {formatDateTime(payment.paidAt)}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-sm">
                            {payment.recordedByName || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {historyPage && historyPage.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-800/30">
                    <p className="text-slate-400 text-sm">
                      نمایش {historyPage.pageNumber * historyPage.pageSize + 1} تا{' '}
                      {Math.min((historyPage.pageNumber + 1) * historyPage.pageSize, historyPage.totalElements)} از{' '}
                      {historyPage.totalElements} پرداخت
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setHistoryCurrentPage((prev) => Math.max(0, prev - 1))}
                        disabled={historyPage.first}
                        className="btn btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                      >
                        قبلی
                      </button>
                      <span className="flex items-center px-3 text-slate-400 text-sm">
                        صفحه {historyPage.pageNumber + 1} از {historyPage.totalPages}
                      </span>
                      <button
                        onClick={() => setHistoryCurrentPage((prev) => prev + 1)}
                        disabled={historyPage.last}
                        className="btn btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                      >
                        بعدی
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">ثبت پرداخت</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Reservation Info */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedPayment.userFullName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedPayment.userFullName || 'کاربر بدون نام'}</p>
                  <p className="text-slate-400 text-sm" dir="ltr">{selectedPayment.userPhoneNumber}</p>
                </div>
              </div>
              <div className="border-t border-slate-700/50 pt-3 space-y-1 text-sm">
                <p className="text-slate-300">
                  <span className="text-slate-500">کلاس:</span> {selectedPayment.activityName}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">تاریخ:</span> {formatDate(selectedPayment.sessionDate)}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">ساعت:</span> {formatTime(selectedPayment.startTime)} - {formatTime(selectedPayment.endTime)}
                </p>
                {selectedPayment.trainerName && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">مربی:</span> {selectedPayment.trainerName}
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  مبلغ (ریال) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min={1000}
                  className="input-field w-full"
                  dir="ltr"
                />
                <p className="text-slate-500 text-xs mt-1">{formatPrice(formData.amount)}</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  روش پرداخت <span className="text-red-400">*</span>
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  {paymentMethods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number (for non-cash) */}
              {formData.method !== 'CASH' && (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">شماره مرجع / شماره پیگیری</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="شماره پیگیری تراکنش"
                    dir="ltr"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">توضیحات</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field w-full h-20 resize-none"
                  placeholder="توضیحات اضافی (اختیاری)..."
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
                  {isSaving ? 'در حال ثبت...' : 'ثبت پرداخت'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Membership Approval Modal */}
      {isMembershipModalOpen && selectedMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">تایید و فعال‌سازی اشتراک</h2>
              <button onClick={closeMembershipModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Membership Info */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedMembership.userName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedMembership.userName || `کاربر #${selectedMembership.userId}`}</p>
                  <p className="text-slate-400 text-sm" dir="ltr">{selectedMembership.userPhone || '-'}</p>
                </div>
              </div>
              <div className="border-t border-slate-700/50 pt-3 space-y-1 text-sm">
                <p className="text-slate-300">
                  <span className="text-slate-500">پلن:</span> {selectedMembership.planName || `پلن #${selectedMembership.planId}`}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">تاریخ شروع:</span> {new Date(selectedMembership.startDate).toLocaleDateString('fa-IR')}
                </p>
                {selectedMembership.endDate && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">تاریخ پایان:</span> {new Date(selectedMembership.endDate).toLocaleDateString('fa-IR')}
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleApproveMembership} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  مبلغ پرداختی (ریال) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={membershipFormData.amount}
                  onChange={handleMembershipInputChange}
                  min={1000}
                  className="input-field w-full"
                  dir="ltr"
                />
                <p className="text-slate-500 text-xs mt-1">{formatPrice(membershipFormData.amount)}</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  روش پرداخت <span className="text-red-400">*</span>
                </label>
                <select
                  name="method"
                  value={membershipFormData.method}
                  onChange={handleMembershipInputChange}
                  className="input-field w-full"
                >
                  {paymentMethods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number (for non-cash) */}
              {membershipFormData.method !== 'CASH' && (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">شماره مرجع / شماره پیگیری</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={membershipFormData.referenceNumber}
                    onChange={handleMembershipInputChange}
                    className="input-field w-full"
                    placeholder="شماره پیگیری تراکنش"
                    dir="ltr"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">توضیحات</label>
                <textarea
                  name="notes"
                  value={membershipFormData.notes}
                  onChange={handleMembershipInputChange}
                  className="input-field w-full h-20 resize-none"
                  placeholder="توضیحات اضافی (اختیاری)..."
                  dir="rtl"
                />
              </div>

              {/* Error */}
              {membershipFormError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {membershipFormError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeMembershipModal} className="btn btn-secondary flex-1">
                  انصراف
                </button>
                <button type="submit" disabled={isApprovingMembership} className="btn btn-primary flex-1 disabled:opacity-50">
                  {isApprovingMembership ? 'در حال تایید...' : 'ثبت پرداخت و فعال‌سازی'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

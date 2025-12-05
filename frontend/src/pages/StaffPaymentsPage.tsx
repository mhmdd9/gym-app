import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import { paymentsApi } from '../api/payments'
import type { Club, PendingPayment, RecordPaymentRequest } from '../types'

// Payment method config
const paymentMethods: { value: RecordPaymentRequest['method']; label: string }[] = [
  { value: 'CASH', label: 'نقدی' },
  { value: 'CARD', label: 'کارت بانکی' },
  { value: 'POS', label: 'دستگاه کارتخوان' },
  { value: 'BANK_TRANSFER', label: 'انتقال بانکی' },
]

// Default session price (can be configured per club/activity later)
const DEFAULT_SESSION_PRICE = 150000 // 150,000 IRR

export default function StaffPaymentsPage() {
  // Clubs state
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Pending payments state
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Load clubs on mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Load pending payments when club changes
  useEffect(() => {
    if (selectedClubId) {
      fetchPendingPayments(selectedClubId)
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
        {(isLoadingClubs || isLoadingPayments) && (
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
    </div>
  )
}

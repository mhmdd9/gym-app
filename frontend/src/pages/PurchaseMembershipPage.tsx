import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import * as membershipsApi from '../api/memberships'
import { SearchableClubSelect } from '../components/SearchableClubSelect'
import type { Club, MembershipPlan } from '../types'

// Plan type config
const planTypeConfig: Record<string, { label: string; className: string }> = {
  TIME_BASED: { label: 'زمانی', className: 'bg-blue-500/20 text-blue-400' },
  SESSION_BASED: { label: 'جلسه‌ای', className: 'bg-purple-500/20 text-purple-400' },
}

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

export default function PurchaseMembershipPage() {
  const navigate = useNavigate()

  // Clubs state
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Plans state
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Purchase state
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  // Load clubs on mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Load plans when club changes
  useEffect(() => {
    if (selectedClubId) {
      fetchPlans(selectedClubId)
    }
  }, [selectedClubId])

  const fetchClubs = async () => {
    try {
      setIsLoadingClubs(true)
      const response = await clubsApi.getAllClubs()
      const allClubs = response.data.data.content || []
      const activeClubs = allClubs.filter((c: Club) => c.isActive)
      setClubs(activeClubs)
      if (activeClubs.length > 0) {
        setSelectedClubId(activeClubs[0].id)
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
      const response = await membershipsApi.getMembershipPlans(clubId)
      setPlans(response.data)
      setSelectedPlanId(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست اشتراک‌ها')
    } finally {
      setIsLoadingPlans(false)
    }
  }

  const handleRequest = async () => {
    if (!selectedClubId || !selectedPlanId) {
      setError('لطفاً یک اشتراک انتخاب کنید')
      return
    }

    const plan = plans.find((p) => p.id === selectedPlanId)
    if (!plan) return

    try {
      setIsPurchasing(true)
      setError(null)

      // Calculate dates based on plan type
      const startDate = new Date().toISOString().split('T')[0]
      let endDate: string | undefined
      let sessionCount: number | undefined

      if (plan.planType === 'TIME_BASED' && plan.durationDays) {
        const end = new Date()
        end.setDate(end.getDate() + plan.durationDays)
        endDate = end.toISOString().split('T')[0]
      } else if (plan.planType === 'SESSION_BASED') {
        sessionCount = plan.sessionCount
        if (plan.validityDays) {
          const end = new Date()
          end.setDate(end.getDate() + plan.validityDays)
          endDate = end.toISOString().split('T')[0]
        }
      }

      await membershipsApi.requestMembership({
        planId: selectedPlanId,
        clubId: selectedClubId,
        startDate,
        endDate,
        sessionCount,
      })

      setPurchaseSuccess(true)
      setTimeout(() => {
        navigate('/memberships')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ثبت درخواست اشتراک')
    } finally {
      setIsPurchasing(false)
    }
  }

  const selectedClub = clubs.find((c) => c.id === selectedClubId)
  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/memberships" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-white">خرید اشتراک</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {purchaseSuccess && (
          <div className="card bg-green-500/10 border-green-500/30 text-center py-8 mb-6">
            <span className="text-5xl mb-4 block">✅</span>
            <h3 className="text-xl text-green-400 mb-2">درخواست اشتراک ثبت شد!</h3>
            <p className="text-slate-400">پس از پرداخت در باشگاه، اشتراک شما فعال خواهد شد.</p>
          </div>
        )}

        {!purchaseSuccess && (
          <div className="max-w-4xl mx-auto">
            {/* Club Selector */}
            {!isLoadingClubs && clubs.length > 0 && (
              <div className="card mb-6">
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
                <p className="text-slate-400">در حال حاضر باشگاهی فعال نیست</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="card bg-red-500/10 border-red-500/30 text-center py-8 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Plans */}
            {!isLoadingPlans && !error && selectedClubId && plans.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-white mb-4">اشتراک‌های موجود</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`card cursor-pointer transition-all ${
                        selectedPlanId === plan.id
                          ? 'border-primary-500 ring-2 ring-primary-500/50'
                          : 'hover:border-slate-600'
                      }`}
                    >
                      {/* Plan Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                          {plan.activityName && <p className="text-slate-400 text-sm">{plan.activityName}</p>}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            planTypeConfig[plan.planType]?.className || 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {planTypeConfig[plan.planType]?.label || plan.planType}
                        </span>
                      </div>

                      {/* Plan Description */}
                      {plan.description && <p className="text-slate-400 text-sm mb-4">{plan.description}</p>}

                      {/* Plan Details */}
                      <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
                        {plan.planType === 'TIME_BASED' && plan.durationDays && (
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
                        )}
                        {plan.planType === 'SESSION_BASED' && (
                          <>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              {plan.sessionCount} جلسه
                            </span>
                            {plan.validityDays && <span className="text-slate-600">اعتبار: {plan.validityDays} روز</span>}
                          </>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-2xl font-bold text-primary-400">{formatPrice(plan.price)}</div>

                      {/* Selection Indicator */}
                      {selectedPlanId === plan.id && (
                        <div className="absolute top-4 left-4">
                          <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Purchase Button */}
                {selectedPlan && (
                  <div className="card bg-slate-800/80">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{selectedPlan.name}</h3>
                        <p className="text-slate-400 text-sm">{selectedClub?.name}</p>
                      </div>
                      <div className="text-2xl font-bold text-primary-400">{formatPrice(selectedPlan.price)}</div>
                    </div>
                    <button
                      onClick={handleRequest}
                      disabled={isPurchasing}
                      className="btn btn-primary w-full py-3 text-lg disabled:opacity-50"
                    >
                      {isPurchasing ? 'در حال پردازش...' : 'ثبت درخواست اشتراک'}
                    </button>
                    <p className="text-slate-500 text-xs text-center mt-2">
                      پس از ثبت درخواست، برای فعال‌سازی به باشگاه مراجعه و پرداخت کنید
                    </p>
                  </div>
                )}
              </>
            )}

            {/* No Plans State */}
            {!isLoadingPlans && !error && selectedClubId && plans.length === 0 && (
              <div className="card text-center py-12">
                <span className="text-5xl mb-4 block">💳</span>
                <h3 className="text-xl text-white mb-2">اشتراکی تعریف نشده</h3>
                <p className="text-slate-400">این باشگاه هنوز اشتراکی تعریف نکرده است</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import * as membershipsApi from '../api/memberships'
import { SearchableClubSelect } from '../components/SearchableClubSelect'
import type { Club, ValidateMembershipResponse, Attendance, UserMembership } from '../types'

// Status config
const membershipStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'در انتظار پرداخت', className: 'bg-orange-500/20 text-orange-400' },
  ACTIVE: { label: 'فعال', className: 'bg-green-500/20 text-green-400' },
  EXPIRED: { label: 'منقضی', className: 'bg-red-500/20 text-red-400' },
  SUSPENDED: { label: 'معلق', className: 'bg-yellow-500/20 text-yellow-400' },
  CANCELLED: { label: 'لغو شده', className: 'bg-slate-500/20 text-slate-400' },
}

// Format time
const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function StaffCheckInPage() {
  // Clubs state
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  // Search state
  const [searchPhone, setSearchPhone] = useState('')
  const [searchUserId, setSearchUserId] = useState<number | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Validation state
  const [validation, setValidation] = useState<ValidateMembershipResponse | null>(null)
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([])
  const [selectedMembershipId, setSelectedMembershipId] = useState<number | null>(null)

  // Check-in state
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null)

  // Today's attendance
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([])
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)

  // Load clubs on mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Load today's attendance when club changes
  useEffect(() => {
    if (selectedClubId) {
      fetchTodayAttendance(selectedClubId)
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
      console.error('Error fetching clubs:', err)
    } finally {
      setIsLoadingClubs(false)
    }
  }

  const fetchTodayAttendance = async (clubId: number) => {
    try {
      setIsLoadingAttendance(true)
      const response = await membershipsApi.getTodayAttendance(clubId)
      setTodayAttendance(response.data)
    } catch (err: any) {
      console.error('Error fetching attendance:', err)
    } finally {
      setIsLoadingAttendance(false)
    }
  }

  const handleSearch = async () => {
    if (!selectedClubId) {
      setSearchError('باشگاه انتخاب نشده است')
      return
    }

    // For now, we'll use a simplified search - in production, you'd search users by phone
    // and get their user ID. Here we'll assume the phone number contains the user ID for testing.
    const userId = parseInt(searchPhone)
    if (isNaN(userId)) {
      setSearchError('شماره تلفن یا شناسه کاربر نامعتبر است')
      return
    }

    try {
      setIsSearching(true)
      setSearchError(null)
      setValidation(null)
      setUserMemberships([])
      setSelectedMembershipId(null)
      setCheckInSuccess(null)

      // Validate membership
      const validationResponse = await membershipsApi.validateMembership(userId, selectedClubId)
      setValidation(validationResponse.data)
      setSearchUserId(userId)

      // Get user memberships
      const membershipsResponse = await membershipsApi.getUserActiveMemberships(userId)
      setUserMemberships(membershipsResponse.data)

      if (membershipsResponse.data.length > 0) {
        setSelectedMembershipId(membershipsResponse.data[0].id)
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'خطا در جستجوی کاربر')
    } finally {
      setIsSearching(false)
    }
  }

  const handleCheckIn = async () => {
    if (!selectedClubId || !searchUserId || !selectedMembershipId) {
      setSearchError('اطلاعات ناقص است')
      return
    }

    try {
      setIsCheckingIn(true)
      setSearchError(null)

      await membershipsApi.checkIn({
        userId: searchUserId,
        membershipId: selectedMembershipId,
        clubId: selectedClubId,
      })

      setCheckInSuccess('ورود با موفقیت ثبت شد')

      // Refresh validation and attendance
      const validationResponse = await membershipsApi.validateMembership(searchUserId, selectedClubId)
      setValidation(validationResponse.data)

      const membershipsResponse = await membershipsApi.getUserActiveMemberships(searchUserId)
      setUserMemberships(membershipsResponse.data)

      fetchTodayAttendance(selectedClubId)
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'خطا در ثبت ورود')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const resetSearch = () => {
    setSearchPhone('')
    setSearchUserId(null)
    setValidation(null)
    setUserMemberships([])
    setSelectedMembershipId(null)
    setSearchError(null)
    setCheckInSuccess(null)
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
              <h1 className="text-xl font-bold text-white">ثبت ورود</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Check-in Panel */}
          <div className="space-y-6">
            {/* Club Selector */}
            {!isLoadingClubs && clubs.length > 0 && (
              <div className="card">
                <SearchableClubSelect
                  clubs={clubs}
                  selectedClubId={selectedClubId}
                  onSelect={(clubId) => {
                    setSelectedClubId(clubId)
                    resetSearch()
                  }}
                  label="باشگاه"
                  className="mb-0"
                />
              </div>
            )}

            {/* Search */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">جستجوی کاربر</h2>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="input-field flex-1"
                  placeholder="شناسه کاربر یا شماره تلفن..."
                  dir="rtl"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchPhone.trim()}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {searchError && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {searchError}
                </div>
              )}

              {checkInSuccess && (
                <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  {checkInSuccess}
                </div>
              )}
            </div>

            {/* Validation Result */}
            {validation && (
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">وضعیت اشتراک</h2>

                <div
                  className={`p-4 rounded-lg border ${
                    validation.valid
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {validation.valid ? (
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className={`text-lg font-medium ${validation.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {validation.message}
                      </p>
                      {validation.endDate && (
                        <p className="text-slate-400 text-sm">
                          اعتبار تا: {new Date(validation.endDate).toLocaleDateString('fa-IR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Membership Selection */}
                {userMemberships.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-slate-400 text-sm mb-2">انتخاب اشتراک برای ثبت ورود</label>
                    <select
                      value={selectedMembershipId || ''}
                      onChange={(e) => setSelectedMembershipId(Number(e.target.value))}
                      className="input-field w-full"
                    >
                      {userMemberships.map((membership) => (
                        <option key={membership.id} value={membership.id}>
                          {membership.planName || `اشتراک #${membership.planId}`}
                          {membership.endDate && ` - تا ${new Date(membership.endDate).toLocaleDateString('fa-IR')}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Check-in Button */}
                {validation.valid && selectedMembershipId && (
                  <button
                    onClick={handleCheckIn}
                    disabled={isCheckingIn}
                    className="btn btn-primary w-full mt-4 py-3 text-lg disabled:opacity-50"
                  >
                    {isCheckingIn ? 'در حال ثبت...' : '✓ ثبت ورود'}
                  </button>
                )}

                {/* Reset Button */}
                <button onClick={resetSearch} className="btn btn-secondary w-full mt-2">
                  جستجوی جدید
                </button>
              </div>
            )}
          </div>

          {/* Today's Attendance */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">ورودهای امروز</h2>
              <span className="text-slate-400 text-sm">{selectedClub?.name}</span>
            </div>

            {isLoadingAttendance ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : todayAttendance.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">📋</span>
                <p className="text-slate-400">هنوز ورودی ثبت نشده است</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {todayAttendance.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {attendance.userName || `کاربر #${attendance.userId}`}
                        </p>
                        <p className="text-slate-500 text-sm">{attendance.userPhone || '-'}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-slate-300 text-sm">{formatTime(attendance.checkInTime)}</p>
                      {attendance.planName && (
                        <p className="text-slate-500 text-xs">{attendance.planName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
              <span className="text-slate-400 text-sm">تعداد کل ورودها:</span>
              <span className="text-white font-bold">{todayAttendance.length}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

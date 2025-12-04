import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { sendOtp, verifyOtp, signup, clearError, resetOtpState } from '../store/slices/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const { isLoading, error, otpSent, otpPhoneNumber } = useAppSelector((state) => state.auth)

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    if (mode === 'login') {
      const result = await dispatch(sendOtp(phoneNumber))
      if (sendOtp.fulfilled.match(result)) {
        setCountdown(result.payload.expiresInSeconds || 300)
      }
    } else {
      const result = await dispatch(signup({ phoneNumber, firstName, lastName }))
      if (signup.fulfilled.match(result)) {
        setCountdown(result.payload.expiresInSeconds || 300)
      }
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    dispatch(verifyOtp({ phoneNumber: otpPhoneNumber!, code: otpCode }))
  }

  const handleBack = () => {
    dispatch(resetOtpState())
    setOtpCode('')
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    dispatch(clearError())
    dispatch(resetOtpState())
    setPhoneNumber('')
    setOtpCode('')
    setFirstName('')
    setLastName('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">سامانه رزرو باشگاه</h1>
          <p className="text-slate-400">ورزش آسان، رزرو ساده</p>
        </div>

        {/* Card */}
        <div className="card">
          {!otpSent ? (
            // Phone Number Form
            <form onSubmit={handleSendOtp} className="space-y-6">
              <h2 className="text-xl font-semibold text-white text-center">
                {mode === 'login' ? 'ورود به حساب' : 'ثبت‌نام'}
              </h2>

              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">نام</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input"
                      placeholder="نام"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">نام خانوادگی</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input"
                      placeholder="نام خانوادگی"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-300 mb-2">شماره موبایل</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input text-left"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                  required
                  pattern="09[0-9]{9}"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !phoneNumber}
                className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    در حال ارسال...
                  </span>
                ) : (
                  'دریافت کد تایید'
                )}
              </button>

              <p className="text-center text-slate-400 text-sm">
                {mode === 'login' ? 'حساب ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  {mode === 'login' ? 'ثبت‌نام کنید' : 'وارد شوید'}
                </button>
              </p>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">تایید شماره موبایل</h2>
                <p className="text-slate-400 text-sm">
                  کد ارسال شده به <span className="text-primary-400 font-medium" dir="ltr">{otpPhoneNumber}</span> را وارد کنید
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">کد تایید</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-[0.5em]"
                  placeholder="------"
                  dir="ltr"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              {countdown > 0 && (
                <p className="text-center text-slate-400 text-sm">
                  زمان باقیمانده: <span className="text-primary-400 font-medium">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                </p>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    در حال تایید...
                  </span>
                ) : (
                  'تایید و ورود'
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full btn btn-secondary py-3"
              >
                بازگشت
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


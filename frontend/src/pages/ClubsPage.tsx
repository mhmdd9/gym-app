import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clubsApi } from '../api/clubs'
import type { Club } from '../types'

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await clubsApi.getAllClubs({ size: 50 })
      setClubs(response.data.data.content)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست باشگاه‌ها')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-white">باشگاه‌ها</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="جستجو بر اساس نام یا شهر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pr-12 w-full"
              dir="rtl"
            />
          </div>
        </div>

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
        {!isLoading && !error && filteredClubs.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">🏢</span>
            <h3 className="text-xl text-white mb-2">باشگاهی یافت نشد</h3>
            <p className="text-slate-400">
              {searchQuery ? 'جستجوی شما نتیجه‌ای نداشت' : 'هنوز باشگاهی ثبت نشده است'}
            </p>
          </div>
        )}

        {/* Clubs Grid */}
        {!isLoading && !error && filteredClubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <Link
                key={club.id}
                to={`/clubs/${club.id}`}
                className="card hover:border-primary-500/50 transition-all group"
              >
                {/* Club Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                    🏋️
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                      {club.name}
                    </h3>
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

                {/* Club Info */}
                {club.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{club.description}</p>
                )}

                {/* Club Details */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-slate-500">
                    {club.openingTime && club.closingTime && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {club.openingTime} - {club.closingTime}
                      </span>
                    )}
                  </div>
                  <span className="text-primary-400 group-hover:translate-x-[-4px] transition-transform">
                    مشاهده ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


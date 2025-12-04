import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, type User, type Role } from '../api/admin'

// Role display config
const roleConfig: Record<string, { label: string; className: string }> = {
  ADMIN: { label: 'مدیر سیستم', className: 'bg-red-500/20 text-red-400' },
  GYM_OWNER: { label: 'صاحب باشگاه', className: 'bg-purple-500/20 text-purple-400' },
  MANAGER: { label: 'مدیر', className: 'bg-blue-500/20 text-blue-400' },
  RECEPTIONIST: { label: 'پذیرش', className: 'bg-green-500/20 text-green-400' },
  TRAINER: { label: 'مربی', className: 'bg-orange-500/20 text-orange-400' },
  MEMBER: { label: 'عضو', className: 'bg-slate-500/20 text-slate-400' },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [currentPage])

  const fetchUsers = async (search?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await adminApi.getUsers({
        search: search || searchQuery || undefined,
        page: currentPage,
        size: 20,
      })
      setUsers(response.data.data.content)
      setTotalElements(response.data.data.totalElements)
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در دریافت لیست کاربران')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await adminApi.getRoles()
      setRoles(response.data.data)
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    fetchUsers(searchQuery)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setSelectedRoles([...user.roles])
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
    setSelectedRoles([])
  }

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    )
  }

  const saveRoles = async () => {
    if (!selectedUser || selectedRoles.length === 0) return

    try {
      setIsSaving(true)
      await adminApi.updateUserRoles(selectedUser.id, { roles: selectedRoles })
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, roles: selectedRoles } : u))
      )
      closeModal()
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در بروزرسانی نقش‌ها')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleUserStatus = async (user: User) => {
    const newStatus = !user.isActive
    const action = newStatus ? 'فعال' : 'غیرفعال'

    if (!confirm(`آیا از ${action} کردن کاربر "${user.phoneNumber}" مطمئن هستید؟`)) {
      return
    }

    try {
      await adminApi.updateUserStatus(user.id, { isActive: newStatus })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u)))
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در تغییر وضعیت کاربر')
    }
  }

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
            <h1 className="text-xl font-bold text-white">مدیریت کاربران</h1>
            <span className="text-slate-400 text-sm">({totalElements} کاربر)</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
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
                placeholder="جستجو بر اساس شماره، نام یا ایمیل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field pr-12 w-full"
                dir="rtl"
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary">
              جستجو
            </button>
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
            <button onClick={() => fetchUsers()} className="btn btn-primary mt-4">
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && users.length === 0 && (
          <div className="card text-center py-12">
            <span className="text-5xl mb-4 block">👤</span>
            <h3 className="text-xl text-white mb-2">کاربری یافت نشد</h3>
            <p className="text-slate-400">
              {searchQuery ? 'جستجوی شما نتیجه‌ای نداشت' : 'هنوز کاربری ثبت نشده است'}
            </p>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && !error && users.length > 0 && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">کاربر</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">نقش‌ها</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">وضعیت</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-medium">آخرین ورود</th>
                    <th className="text-center py-4 px-6 text-slate-400 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                            {user.firstName?.charAt(0) || user.phoneNumber.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.fullName || user.firstName || 'بدون نام'}
                            </p>
                            <p className="text-slate-400 text-sm font-mono" dir="ltr">
                              {user.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => {
                            const config = roleConfig[role] || {
                              label: role,
                              className: 'bg-slate-500/20 text-slate-400',
                            }
                            return (
                              <span
                                key={role}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
                              >
                                {config.label}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            فعال
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 text-sm">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            غیرفعال
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-400 text-sm" dir="ltr">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('fa-IR')
                            : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors"
                            title="ویرایش نقش‌ها"
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
                            onClick={() => toggleUserStatus(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            }`}
                            title={user.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                          >
                            {user.isActive ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalElements > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="btn btn-secondary disabled:opacity-50"
            >
              قبلی
            </button>
            <span className="flex items-center px-4 text-slate-400">
              صفحه {currentPage + 1} از {Math.ceil(totalElements / 20)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={(currentPage + 1) * 20 >= totalElements}
              className="btn btn-secondary disabled:opacity-50"
            >
              بعدی
            </button>
          </div>
        )}
      </main>

      {/* Edit Roles Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">ویرایش نقش‌های کاربر</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-400 mb-2">کاربر:</p>
              <p className="text-white font-medium">
                {selectedUser.fullName || selectedUser.firstName || selectedUser.phoneNumber}
              </p>
              <p className="text-slate-400 text-sm font-mono" dir="ltr">
                {selectedUser.phoneNumber}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-slate-400 mb-3">نقش‌ها را انتخاب کنید:</p>
              <div className="space-y-2">
                {roles.map((role) => {
                  const config = roleConfig[role.name] || {
                    label: role.name,
                    className: 'bg-slate-500/20 text-slate-400',
                  }
                  const isSelected = selectedRoles.includes(role.name)
                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                          {config.label}
                        </span>
                        {role.description && (
                          <span className="text-slate-500 text-sm">{role.description}</span>
                        )}
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedRoles.length === 0 && (
              <p className="text-red-400 text-sm mb-4">حداقل یک نقش باید انتخاب شود</p>
            )}

            <div className="flex gap-3">
              <button onClick={closeModal} className="btn btn-secondary flex-1">
                انصراف
              </button>
              <button
                onClick={saveRoles}
                disabled={isSaving || selectedRoles.length === 0}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

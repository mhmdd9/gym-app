import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-amber-500 font-mono">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-white">Access Denied</h2>
        <p className="mt-2 text-slate-400 max-w-md">
          You don't have permission to access this page. Please contact an administrator if you believe this is a
          mistake.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-slate-500 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage


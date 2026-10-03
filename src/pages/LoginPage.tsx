import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { LOGO_URL } from '../data/brand'

export function LoginPage() {
  const { user, status, error, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // Already signed in — don't show the login screen again.
  if (user) {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  const isLoading = status === 'loading'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const success = await login(username.trim(), password)
    if (success) {
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/'
      navigate(redirectTo, { replace: true })
    }
  }

  return (
    <div className="min-h-screen w-full bg-surface flex items-center justify-center px-gutter-mobile py-space-lg">
      <div className="w-full max-w-sm flex flex-col items-center gap-space-lg">
        <div className="flex items-center gap-2.5">
          <img alt="Devyora Hooks logo" className="h-9 w-auto object-contain" src={LOGO_URL} />
          <div className="flex flex-col">
            <span className="font-title text-title text-on-surface tracking-tight">
              Devyora Hooks
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wide">
              Script Intel
            </span>
          </div>
        </div>

        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md lg:p-space-lg flex flex-col gap-space-md">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:text-headline-md lg:font-headline-md text-on-surface tracking-tight">
              Welcome Back
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Sign in to your account
            </p>
          </div>

          <form className="flex flex-col gap-space-sm" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="login-username"
                className="font-label-md text-label-md text-on-surface font-semibold"
              >
                Username
              </label>
              <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary">
                <Icon name="person" className="text-on-surface-variant text-[18px]" />
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  autoFocus
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="login-password"
                className="font-label-md text-label-md text-on-surface font-semibold"
              >
                Password
              </label>
              <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary">
                <Icon name="lock" className="text-on-surface-variant text-[18px]" />
                <input
                  id="login-password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  className="text-on-surface-variant shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  <Icon name={isPasswordVisible ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-error-container/40 text-on-error-container rounded-lg p-2.5 flex items-start gap-2"
              >
                <Icon name="error_outline" className="text-error text-[18px] shrink-0 mt-0.5" />
                <p className="font-body-sm text-body-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isLoading || !username.trim() || !password}
              className="mt-1 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Icon name="progress_activity" className="text-[18px] animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

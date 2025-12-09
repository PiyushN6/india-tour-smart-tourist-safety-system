import React, { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface SignupPageProps {
  onClose?: () => void
}

const SignupPage: React.FC<SignupPageProps> = ({ onClose }) => {
  const { resetPassword, signInWithEmail, signUpWithEmail, signInWithGoogle, getLoginMethodForEmail } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const email = formData.email.trim()
    const password = formData.password

    if (!email || !password) {
      alert('Please enter both email and password.')
      return
    }

    if (mode === 'signup') {
      // If this email is already locked to Google, prevent password signup
      const existingMethod = await getLoginMethodForEmail(email)
      if (existingMethod === 'google') {
        alert('This India Tour email already uses Google sign-in. Please use "Continue with Google" to access it.')
        return
      }
    }

    if (mode === 'signup') {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const { error } = await signUpWithEmail(email, password, fullName || email)
      if (error) {
        console.error('Error signing up:', error)
        alert('Could not create account. Please check your details and try again.')
        return
      }

      // New account: ask user to verify email, keep modal open
      alert('Account created. Verify the link in your email, then log in.')
      return
    }

    // Login flow: close modal on success
    // If this email is locked to Google sign-in, block password login before hitting Supabase
    const existingMethod = await getLoginMethodForEmail(email)
    if (existingMethod === 'google') {
      alert('This India Tour account uses Google sign-in. Please use "Continue with Google" for this email.')
      return
    }

    const { error } = await signInWithEmail(email, password)
    if (error) {
      console.error('Error signing in:', error)
      alert('Invalid email or password. Please try again.')
      return
    }

    onClose?.()
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full bg-white h-[560px]">
        {/* Left Panel */}
        <div className="flex-1 relative overflow-hidden md:block hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-700">
          {/* Back button (top-left) */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            <button
              onClick={() => {
                onClose?.()
              }}
              className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Centered logo + title */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/40">
              <img
                src="/images/logo.png"
                alt="India Tour logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold tracking-wide text-white/90 uppercase">
                India Tour
              </span>
              <span className="text-xs text-white/70">
                Smart Tourist Safety System
              </span>
            </div>
          </div>

          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80"
              alt="Safe travel in India"
              className="w-full h-full object-cover opacity-50"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8 pb-8">
            <div className="max-w-md space-y-2">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-emerald-200 backdrop-blur">
                Trusted by smart travelers across India
              </p>
              <h2 className="text-3xl font-semibold text-white leading-snug">
                Plan safer journeys with real-time insights and smart itineraries.
              </h2>
              <p className="text-[13px] text-white/80">
                India Tour combines destination discovery, live safety alerts, and digital ID tools so you can
                explore confidently from the Himalayas to the coastline.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 px-5 sm:px-7 pt-12 sm:pt-14 pb-8 sm:pb-10 flex flex-col justify-center relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm"
            >
              Close
            </button>
          )}

          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'signup' ? 'Create an Account' : 'Welcome back'}
            </h1>
            <p className="text-gray-600 text-sm">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setMode('login')}
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  New to India Tour?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setMode('signup')}
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-saffron/60 focus:border-primary-saffron outline-none transition-all"
                    required={mode === 'signup'}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-saffron/60 focus:border-primary-saffron outline-none transition-all"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-saffron/60 focus:border-primary-saffron outline-none transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  onClick={async () => {
                    if (!formData.email) {
                      alert('Please enter your email address first.');
                      return;
                    }
                    const { error } = await resetPassword(formData.email)
                    if (error) {
                      console.error('Error sending reset password email:', error)
                      alert('Could not send reset link. Please try again.')
                    } else {
                      alert('Password reset link sent to your email address.')
                    }
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-saffron/60 focus:border-primary-saffron outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms & Submit */}
            <p className="text-xs text-gray-500 leading-relaxed">
              By signing in, you accept the{' '}
              <button type="button" className="text-gray-800 font-medium hover:underline">
                Terms of Service
              </button>{' '}
              and acknowledge our{' '}
              <button type="button" className="text-gray-800 font-medium hover:underline">
                Privacy Policy
              </button>
              .
            </p>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              {mode === 'signup' ? 'Create Account' : 'Log in'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <button
              type="button"
              className="w-full -mt-6 flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
              onClick={async () => {
                try {
                  const email = formData.email.trim()

                  if (email) {
                    const method = await getLoginMethodForEmail(email)
                    if (method === 'password') {
                      alert('This India Tour account uses email & password. Log in with your email and password, not Google.')
                      return
                    }
                  }

                  await signInWithGoogle()
                  onClose?.()
                } catch (error) {
                  console.error('Error with Google sign-in:', error)
                  alert('Could not sign in with Google. Please try again.')
                }
              }}
            >
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white overflow-hidden">
                <span className="sr-only">Google</span>
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-1.9 3.1l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.4-.2-2H12z"
                  />
                  <path
                    fill="#34A853"
                    d="M6.6 14.3l-.9.7-2.5 1.9C4.7 19.9 8.1 22 12 22c2.4 0 4.5-.8 6-2.3l-3.1-2.4c-.8.5-1.8.8-2.9.8-2.3 0-4.2-1.5-4.9-3.6z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.2 7.3C2.4 8.4 2 9.7 2 11c0 1.3.4 2.6 1.2 3.7 0 0 2.2-1.7 3.4-2.6-.2-.5-.3-1-.3-1.5 0-.5.1-1 .3-1.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M12 4.5c1.3 0 2.4.4 3.3 1.2l2.5-2.5C16.5 1.7 14.4.9 12 .9 8.1.9 4.7 3.1 3.2 7.3l3.7 2.8C7.8 6 9.7 4.5 12 4.5z"
                  />
                  <path fill="none" d="M2 2h20v20H2z" />
                </svg>
              </span>
              <span>Continue with Google</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPage

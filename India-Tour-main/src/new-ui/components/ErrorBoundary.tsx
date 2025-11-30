import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import Button from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and could be sent to error tracking service
    console.error('Error Boundary caught an error:', error, errorInfo)

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
      // Or your custom error tracking
      this.reportError(error, errorInfo)
    }

    this.setState({ errorInfo })
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // This would integrate with your error reporting service
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Send to your error tracking service
    // Example API call to your backend
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport),
    }).catch(() => {
      // Silently fail error reporting
    })
  }

  handleReload = () => {
    // Clear any cached state that might be causing the error
    window.location.reload()
  }

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/'
  }

  renderErrorPage = () => {
    if (this.props.fallback) {
      return this.props.fallback
    }

    const isDevelopment = process.env.NODE_ENV === 'development'

    return (
      <div className="min-h-screen bg-background-warm-offwhite flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center"
          >
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </motion.div>

          {/* Error Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We encountered an unexpected error while loading this page.
              Don't worry, your safety information is still available.
            </p>
          </motion.div>

          {/* Error ID */}
          {this.state.errorId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 bg-yellow-50 border-yellow-200 max-w-md mx-auto"
            >
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Error ID:</span> {this.state.errorId}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Please reference this ID if you contact support
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              variant="primary"
              size="large"
              icon={<RefreshCw className="w-5 h-5" />}
              onClick={this.handleReload}
              className="w-full sm:w-auto"
            >
              Reload Page
            </Button>
            <Button
              variant="secondary"
              size="large"
              icon={<Home className="w-5 h-5" />}
              onClick={this.handleGoHome}
              className="w-full sm:w-auto"
            >
              Go to Homepage
            </Button>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 border-red-200 max-w-md mx-auto"
          >
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Emergency Support
            </h2>
            <p className="text-sm text-red-700 mb-4">
              If this is an emergency situation, please contact:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <a
                href="tel:112"
                className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              >
                <div className="text-xs text-red-600">Emergency</div>
                <div className="text-lg font-bold text-red-800">112</div>
              </a>
              <a
                href="tel:100"
                className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <div className="text-xs text-blue-600">Police</div>
                <div className="text-lg font-bold text-blue-800">100</div>
              </a>
              <a
                href="tel:108"
                className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <div className="text-xs text-green-600">Ambulance</div>
                <div className="text-lg font-bold text-green-800">108</div>
              </a>
            </div>
          </motion.div>

          {/* Development Details */}
          {isDevelopment && this.state.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-left"
            >
              <details className="glass-card p-4 bg-gray-50 border-gray-200">
                <summary className="cursor-pointer flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  <Bug className="w-4 h-4" />
                  <span>Development Error Details</span>
                </summary>
                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-1">Error Message:</h4>
                    <pre className="bg-red-50 p-2 rounded text-red-800 overflow-x-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-1">Stack Trace:</h4>
                    <pre className="bg-red-50 p-2 rounded text-red-800 overflow-x-auto whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-1">Component Stack:</h4>
                      <pre className="bg-red-50 p-2 rounded text-red-800 overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </motion.div>
          )}

          {/* Reassurance Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-gray-500"
          >
            <p>
              We're working hard to make this platform as reliable as possible.
              Your safety is our top priority, and all emergency features remain functional.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorPage()
    }

    return this.props.children
  }
}

export default ErrorBoundary
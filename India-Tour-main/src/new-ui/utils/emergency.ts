export const EMERGENCY_NUMBER = '112'

// Centralized SOS behavior for both navbar and homepage buttons.
// Optionally accepts a navigate function from react-router to also open the in‑app safety dashboard.
export const handleEmergencySOS = (navigate?: (path: string) => void) => {
  if (typeof window !== 'undefined') {
    try {
      // On most devices this will open the system dialer with the emergency number pre‑filled.
      window.location.href = `tel:${EMERGENCY_NUMBER}`
    } catch {
      // If tel: is not supported, just ignore and fall back to in‑app navigation below.
    }
  }

  if (navigate) {
    navigate('/safety/dashboard')
  }
}

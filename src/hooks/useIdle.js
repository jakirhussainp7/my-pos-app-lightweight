import { useState, useEffect, useCallback } from 'react'

export const useIdle = (timeout = 300000) => { // 5 minutes default
  const [isIdle, setIsIdle] = useState(false)

  const resetTimer = useCallback(() => {
    setIsIdle(false)
  }, [])

  useEffect(() => {
    let timeoutId

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsIdle(true), timeout)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true)
    })

    resetTimeout()

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true)
      })
    }
  }, [timeout])

  return { isIdle, resetTimer }
}
import { useEffect, useState } from 'react'
import OneSignal from 'react-onesignal'
import './App.css'

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || ''

function App() {
  const [initialized, setInitialized] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined' || !ONESIGNAL_APP_ID) return

    OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false,
      },
    })
      .then(() => {
        setInitialized(true)
        return OneSignal.User.PushSubscription.id()
      })
      .then((id) => {
        setIsSubscribed(!!id)
      })
      .catch((err) => {
        console.error('OneSignal init error:', err)
        setInitialized(true)
      })
  }, [])

  useEffect(() => {
    if (!initialized) return

    const refreshSubscriptionState = () => {
      OneSignal.User.PushSubscription.id().then((id) => setIsSubscribed(!!id))
    }

    OneSignal.Notifications.addEventListener('permissionChange', refreshSubscriptionState)
    OneSignal.User.PushSubscription.addEventListener('change', refreshSubscriptionState)

    const clickHandler = (event) => {
      const data = event.notification?.payload?.additionalData || {}
      const title = event.notification?.title || 'Notification'
      const body = event.notification?.body || ''
      setNotifications((prev) => [
        { title, body, data, at: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ])
    }

    OneSignal.Notifications.addEventListener('click', clickHandler)

    const foregroundHandler = (event) => {
      event.notification.title && event.notification.body &&
        setNotifications((prev) => [
          {
            title: event.notification.title,
            body: event.notification.body,
            at: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 9),
        ])
    }

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', foregroundHandler)

    return () => {
      OneSignal.Notifications.removeEventListener('permissionChange', refreshSubscriptionState)
      OneSignal.User.PushSubscription.removeEventListener('change', refreshSubscriptionState)
      OneSignal.Notifications.removeEventListener('click', clickHandler)
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', foregroundHandler)
    }
  }, [initialized])

  const handleSubscribe = async () => {
    if (!initialized) return
    try {
      const granted = await OneSignal.Notifications.requestPermission()
      if (granted) {
        await OneSignal.User.PushSubscription.optIn()
        const id = await OneSignal.User.PushSubscription.id()
        setIsSubscribed(!!id)
      }
    } catch (e) {
      console.error('Subscribe error:', e)
    }
  }

  const handleUnsubscribe = async () => {
    if (!initialized) return
    try {
      await OneSignal.User.PushSubscription.optOut()
      setIsSubscribed(false)
    } catch (e) {
      console.error('Unsubscribe error:', e)
    }
  }

  if (!ONESIGNAL_APP_ID) {
    return (
      <div className="card" style={{ borderLeft: '4px solid #e11d48' }}>
        <h1>OneSignal not configured</h1>
        <p className="subtitle">
          Create a <code>.env</code> file in the project root with:
        </p>
        <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
          VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
        </pre>
        <p className="subtitle" style={{ marginTop: '1rem' }}>
          Get your App ID from{' '}
          <a href="https://dashboard.onesignal.com" target="_blank" rel="noopener noreferrer">
            OneSignal Dashboard → Settings → Keys &amp; IDs
          </a>
          . Add the OneSignal Service Worker to <code>public/OneSignalSDKWorker.js</code> (see README).
        </p>
      </div>
    )
  }

  return (
    <>
      <h1>Push Notifications</h1>
      <p className="subtitle">React + Vite + OneSignal</p>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className={`status status-${isSubscribed ? 'subscribed' : 'unsubscribed'}`}>
            {initialized ? (isSubscribed ? 'Subscribed' : 'Not subscribed') : 'Loading…'}
          </span>
          {initialized && (
            <>
              {!isSubscribed ? (
                <button type="button" className="btn btn-primary" onClick={handleSubscribe}>
                  Enable push notifications
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={handleUnsubscribe}>
                  Disable push notifications
                </button>
              )}
            </>
          )}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--subtitle, #64748b)' }}>
          {isSubscribed
            ? 'You will receive push notifications in this browser.'
            : 'Allow notifications to receive push messages when the app is open or in the background.'}
        </p>
      </div>

      {notifications.length > 0 && (
        <div className="card notification-log">
          <h4>Recent notifications</h4>
          <ul>
            {notifications.map((n, i) => (
              <li key={i}>
                <strong>{n.title}</strong>
                {n.body && ` — ${n.body}`} <small>({n.at})</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default App

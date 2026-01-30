# React Push Notifications (Vite + OneSignal)

A React app built with Vite that receives web push notifications via [OneSignal](https://onesignal.com/).

## Setup

### 1. OneSignal app

1. Sign up at [OneSignal](https://onesignal.com/) and create an app.
2. Add a **Web Push** platform and choose **Typical Site**.
3. In **Settings → Keys & IDs**, copy your **OneSignal App ID**.

### 2. Environment

Copy the example env and set your App ID:

```bash
cp .env.example .env
```

Edit `.env` and set:

```
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
```

### 3. OneSignal Service Worker

OneSignal needs a service worker file on your origin:

1. Download the [OneSignal Service Worker](https://github.com/OneSignal/OneSignal-Website-SDK/files/11480764/OneSignalSDK-v16-ServiceWorker.zip) (or from [OneSignal docs](https://documentation.onesignal.com/docs/onesignal-service-worker)).
2. Unzip and place `OneSignalSDKWorker.js` in the **`public`** folder so it is served at `/OneSignalSDKWorker.js`.
3. Confirm it’s reachable at `http://localhost:5173/OneSignalSDKWorker.js` when running the dev server.

### 4. Install and run

```bash
npm install
npm run dev
```

Open the app (e.g. `http://localhost:5173`), click **Enable push notifications**, allow when the browser prompts, and you’ll be subscribed. Notifications received (in foreground or background) will show in the “Recent notifications” list.

## Sending a test notification

1. In OneSignal Dashboard go to **Audience → Subscriptions** and confirm your browser appears as **Subscribed**.
2. Optionally add it to **Test Subscriptions** and create a **Test Users** segment.
3. Send a message from **Messages → New Message** (or use the [OneSignal REST API](https://documentation.onesignal.com/reference/create-notification)) targeting **Subscribed Users** or your **Test Users** segment.

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build locally

## Notes

- Use a normal browser window; push is not supported in private/incognito.
- For localhost, `allowLocalhostAsSecureOrigin` is set in the OneSignal init so web push works in development.
- Configure your production site URL in the OneSignal Web Push settings when you deploy.

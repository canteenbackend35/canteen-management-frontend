# Canteen Management Frontend

This is the frontend for the Canteen Management System, built with React Native and Expo. It connects to a backend API and supports authentication, live order tracking, and more. This README covers setup, API client configuration, and running the app on multiple devices (including using your phone's IP address).

## Features

- User authentication (signup, OTP, callback)
- Live order dashboard
- Modular UI components
- API client for backend communication
- Android and iOS support

## Prerequisites

- Node.js (v16+ recommended)
- npm
- Android Studio or Xcode (for device emulation)
- Access to the backend API (see below)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/canteenbackend35/canteen-management-frontend.git
cd canteen-management-frontend
```

### 2. Install Dependencies

```bash
npm install

```

### 3. Configure the API Client

Edit `lib/api-config.ts` and set your backend API URL:

```ts
export const API_BASE_URL = "http://<YOUR_BACKEND_IP>:<PORT>";
```

Replace `<YOUR_BACKEND_IP>` and `<PORT>` with your backend server's IP address and port.

#### Important: Application Scheme for Redirection

This app uses the Expo scheme `cc` (see `app.json`) as the name of the application. The backend and Supabase use this scheme for authentication and magic link redirection. Make sure your backend and Supabase configuration use `cc://` for redirect URLs.

Example redirect URL:

```
cc://auth/callback
```

If you change the scheme in `app.json`, update your backend and Supabase settings accordingly.

#### How to Find Your IP Address

- On Linux/macOS:
  ```bash
  ip addr | grep inet
  ```
- On Windows:
  ```cmd
  ipconfig
  ```
- On your phone (for testing on other devices):
  - Connect both devices to the same WiFi.
  - Find your computer's IP address as above.
  - Use that IP in the API client config.

### 4. Running the App

#### On Android

```bash
npx expo run:android
```

#### On iOS

```bash
npx expo run:ios
```

#### On Expo Go (Testing Only)

Expo Go is for development and testing only. **Do not use Expo Go for authentication or production features.** Magic link and deep link redirection will not work in Expo Go, as it does not support custom schemes like `cc://`. Always use a development build or emulator for full functionality.

Steps for Expo Go (testing UI only):

1. Install Expo Go from the App Store/Play Store.
2. Run:

```bash
npx expo start
```

3. Scan the QR code with Expo Go.
4. **Authentication and redirection will NOT work in Expo Go.**

## API Client Example

See `lib/api-client.ts` for usage. Example:

```ts
import { API_BASE_URL } from "./api-config";

export async function fetchOrders() {
  const res = await fetch(`${API_BASE_URL}/orders`);
  return res.json();
}
```

## Troubleshooting

- **Network errors:** Ensure your phone and computer are on the same WiFi and the backend IP is correct.
- **Authentication issues:** Check backend logs and API client config.
- **Expo Go not connecting:** Try restarting Expo and your phone.

## Contributing

Pull requests are welcome! Please open issues for bugs or feature requests.

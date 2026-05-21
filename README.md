<div align="center">

  <img src="assets/images/icon.png" width="96" height="96" alt="Quipay Logo" />

  <h1>Quipay Mobile</h1>
  <p><strong>Real-time payroll streaming — in your pocket</strong></p>

[![License](https://img.shields.io/badge/License-MIT-F5C249?style=flat-square&labelColor=000)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-F5C249?style=flat-square&labelColor=000)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-F5C249?style=flat-square&labelColor=000)](https://reactnative.dev)
[![Web3Auth](https://img.shields.io/badge/Auth-Web3Auth-F5C249?style=flat-square&labelColor=000)](https://web3auth.io)

[Overview](#overview) · [Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Project Structure](#project-structure)

</div>

---

## Overview

Quipay Mobile is the worker-facing iOS and Android app for the [Quipay](https://github.com/Quipay-Core) payroll streaming protocol. Workers sign in with their existing Google or Apple account — no seed phrases, no crypto knowledge required — and immediately start tracking their real-time earnings from employer-created payment streams.

```
Worker signs in with Google
  → Web3Auth creates a non-custodial wallet automatically
  → Stellar address derived from the wallet key
  → Employer streams salary per second to that address
  → Worker withdraws anytime, straight to their wallet
```

---

## Features

- **Frictionless onboarding** — Sign in with Google, Apple, or email magic link. No seed phrase, no MetaMask, no extensions.
- **Live earnings dashboard** — See total earned, amount available to withdraw, and active streams at a glance.
- **Stream tracking** — Monitor all active, completed, and cancelled payment streams from your employer.
- **Instant withdrawal** — Withdraw earned funds directly to your wallet at any time.
- **Non-custodial** — Your private key is derived via Web3Auth's MPC infrastructure. Only you control it.
- **Multi-chain ready** — Auth layer built on Web3Auth supports Stellar today, EVM and Bitcoin extendable.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 + Expo Router (file-based navigation) |
| Language | TypeScript |
| Auth | Web3Auth (`@web3auth/react-native-sdk`) — email, Google, Apple |
| Wallet | Stellar keypair derived from Web3Auth ed25519 key |
| UI | React Native + NativeWind |
| Font | Urbanist (matches Quipay web app) |
| Icons | `@expo/vector-icons` (Ionicons) |
| SVG | `react-native-svg` — logo rendered in code, no PNGs |
| Gradient | `expo-linear-gradient` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or Android Emulator
- A [Web3Auth](https://dashboard.web3auth.io) account for the Client ID

### Install

```bash
git clone https://github.com/Quipay-Core/quipay-mobile.git
cd quipay-mobile
npm install
```

### Configure Web3Auth

1. Go to [dashboard.web3auth.io](https://dashboard.web3auth.io)
2. Create a project → **Plug and Play** → **Mobile**
3. Add whitelist URL: `quipay://web3auth`
4. Copy your **Client ID**
5. Paste it into `src/services/web3auth.ts`:

```ts
export const WEB3AUTH_CLIENT_ID = "YOUR_CLIENT_ID_HERE";
```

### Run

> **Important:** Web3Auth does not work with Expo Go. You must use a custom dev client.

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# Or start the dev server (requires prebuild)
npx expo start --clear
```

---

## Project Structure

```
quipay-mobile/
├── app/                        # Expo Router — routing only (thin re-exports)
│   ├── index.tsx               # Splash screen entry
│   ├── (auth)/                 # Auth group
│   │   ├── index.tsx           # Welcome screen
│   │   └── connect.tsx         # Sign in screen
│   └── (tabs)/                 # Main app tabs
│       ├── index.tsx           # Earnings
│       ├── streams.tsx         # Streams
│       ├── withdraw.tsx        # Withdraw
│       └── settings.tsx        # Settings
│
├── src/
│   ├── components/
│   │   ├── layout/             # ScreenHeader
│   │   └── ui/                 # Logo, StatCard, EmptyState, Badge
│   ├── constants/              # Theme colors, gradient tokens
│   ├── context/                # AuthContext — global auth state
│   ├── hooks/                  # useTheme
│   ├── polyfills/              # Node stdlib shims for Metro
│   ├── screens/                # All screen UI lives here
│   │   ├── auth/               # WelcomeScreen, ConnectScreen
│   │   ├── earnings/           # EarningsScreen
│   │   ├── splash/             # SplashScreen
│   │   ├── streams/            # StreamsScreen
│   │   ├── withdraw/           # WithdrawScreen
│   │   └── settings/           # SettingsScreen
│   ├── services/               # web3auth.ts, stellar.ts
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # formatXLM, shortenAddress
│
├── assets/                     # App icon, fonts
├── scripts/
│   └── patch-web3auth.js       # Postinstall patch for @toruslabs Node compat
└── metro.config.js             # Node stdlib polyfill resolver
```

---

## Auth Flow

```
App opens
  └─ Splash (checks Web3Auth session)
       ├─ Session exists  →  Tabs (Earnings)
       └─ No session      →  Welcome screen
                                └─ "Get Started"
                                      └─ Connect screen
                                            ├─ Email magic link
                                            ├─ Continue with Google
                                            └─ Continue with Apple
                                                  └─ Tabs (Earnings)
```

After login, Web3Auth returns an **ed25519 private key**. We call `Keypair.fromRawEd25519Seed()` from `@stellar/stellar-base` to derive a Stellar G... address. That address is used for all payroll operations.

---

## Related Repos

| Repo | Description |
|---|---|
| [quipay-frontend](https://github.com/Quipay-Core/quipay-frontend) | Employer web app (React + Vite) |
| [quipay-contracts](https://github.com/Quipay-Core/quipay-contracts) | Soroban smart contracts (Rust) |
| [quipay-backend](https://github.com/Quipay-Core/quipay-backend) | API server |

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

<div align="center">
  <p>Built with ♥ by the Quipay team</p>
</div>

# Zeyora - Next-Generation Delivery Service Platform

<p align="center">
  <img src="https://via.placeholder.com/200x200/FF6B35/FFFFFF?text=Z" alt="Zeyora Logo" width="100"/>
</p>

<p align="center">
  A comprehensive delivery service platform built with React Native, React.js, Node.js, PostgreSQL, and MongoDB.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-20-brightgreen" />
  <img src="https://img.shields.io/badge/React%20Native-0.73-blue" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-red" />
  <img src="https://img.shields.io/badge/MongoDB-7-green" />
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Customer App (User App)
- 📱 Account creation with phone/email/social login
- 🍔 Real-time order placement (food, groceries, parcels)
- 📍 Live tracking with GPS integration
- 💳 Multiple payment options (UPI, cards, wallets, COD)
- 🔔 Push notifications for order status
- ⭐ Loyalty points, discounts, and referral system

### Delivery Partner App
- 🚗 Easy onboarding with KYC verification
- ✅ Order acceptance/rejection system
- 🗺️ Route optimization with live traffic
- 💰 Earnings dashboard with daily/weekly payouts
- 🆘 SOS button for safety

### Vendor Dashboard
- 📋 Menu/product management
- 📦 Order tracking and fulfillment
- 📊 Analytics on sales, customer behavior, peak hours
- 🔔 Automated inventory alerts

### Admin Panel
- 👥 Manage users, vendors, and delivery partners
- 📈 Real-time monitoring of orders and logistics
- 🔒 Fraud detection and security alerts
- 📉 Advanced analytics with AI insights
- ⚙️ Configurable commission and payout system

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
├──────────────┬──────────────┬──────────────┬──────────────────┤
│  User App    │  Partner App  │   Vendor     │    Admin Panel    │
│ (React Native)│ (React Native)│ (React Web)  │    (React Web)    │
└──────┬───────┴───────┬──────┴──────┬───────┴────────┬─────────┘
       │                │             │                │
       └────────────────┼─────────────┼────────────────┘
                        │             │
                        ▼             ▼
              ┌────────────────────────┐
              │      API Gateway        │
              │      (Express.js)        │
              └───────────┬──────────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │  MongoDB    │  │   Redis     │
│ (Relational)│  │  (Products) │  │  (Cache)    │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile Apps** | React Native (Expo) |
| **Web Apps** | React.js + TypeScript + TailwindCSS |
| **Backend API** | Node.js + Express.js + TypeScript |
| **Databases** | PostgreSQL 15, MongoDB 7 |
| **Cache** | Redis 7 |
| **Authentication** | JWT + OAuth 2.0 |
| **Payments** | Razorpay, Stripe |
| **Maps** | Google Maps API |
| **Containerization** | Docker, Kubernetes |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
zeyora/
├── apps/
│   ├── user-app/           # Customer mobile app (React Native)
│   ├── partner-app/         # Delivery partner app (React Native)
│   ├── vendor-dashboard/    # Vendor web dashboard (React)
│   └── admin-panel/         # Admin web panel (React)
├── packages/
│   ├── api/                # Backend API (Express.js)
│   ├── shared/             # Shared types and utilities
│   └── config/             # Shared configurations
├── k8s/                    # Kubernetes manifests
├── docker/                 # Docker configurations
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
└── docs/                   # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 9+ or pnpm
- Docker Desktop
- PostgreSQL 15
- MongoDB 7
- Redis 7

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/zeyora.git
   cd zeyora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp packages/api/.env.example packages/api/.env
   # Edit .env with your configuration
   ```

4. **Start databases with Docker**
   ```bash
   docker-compose up -d postgres mongo redis
   ```

5. **Run database migrations**
   ```bash
   cd packages/api
   npx prisma migrate dev
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all development servers |
| `npm run dev:api` | Start backend API |
| `npm run dev:user` | Start User App |
| `npm run dev:partner` | Start Partner App |
| `npm run dev:vendor` | Start Vendor Dashboard |
| `npm run dev:admin` | Start Admin Panel |
| `npm run build` | Build all packages |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

## 🚢 Deployment

### Docker

```bash
# Build images
docker-compose build

# Deploy
docker-compose up -d
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/production/

# Check status
kubectl get pods -n production
```

---

## 📖 Documentation

- [SPEC.md](./SPEC.md) - Detailed specification document
- [API Documentation](./packages/api/README.md) - Backend API docs
- [Architecture Overview](./docs/architecture.md) - System design
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the Zeyora Team
</p>
Delivery Re-Invented..

<div align="center">

# <span style="background: linear-gradient(135deg, #6c63ff 0%, #00e5c0 50%, #6c63ff 100%);">DEX</span> Aggregator

**A high-performance cryptocurrency exchange aggregator with intelligent multi-path routing**

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge)](https://orm.drizzle.team)

<p>
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Chart%20Increasing.png" width="80" />
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Coin.png" width="80" />
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gear.png" width="80" />
</p>

![Live](https://img.shields.io/badge/Live%20on%20Vercel-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)
![Open Source](https://img.shields.io/badge/Open%20Source-ff6b6b?style=for-the-badge&logo=open-source-initiative&logoColor=white)

</div>

---

<div align="center">

## 📊 Stats at a Glance

| 💎 Assets | 🏢 Providers | ⚡ Route Calc |
|:---------:|:------------:|:-------------:|
| **100+** | **8+** | **<100ms** |
| Crypto assets | DEX providers | Path finding |

</div>

---

## ✨ Features

### ⚡ Smart Multi-Path Routing
Yen's K-Shortest Paths Algorithm discovers multiple optimal routes across 8+ exchange providers, ensuring you always get the best rates.

### 📈 Real-Time Price Simulation
Geometric Brownian Motion (GBM) simulator generates realistic price movements for 100+ crypto assets every 60 seconds.

### 🎯 Best Rate Guarantee
The pathfinding engine analyzes thousands of route combinations to find the most cost-effective swaps with minimal slippage.

### 🔐 Secure Authentication
Clerk-powered authentication with enterprise-grade security, session management, and seamless OAuth integration.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React 18  │  │   Vite      │  │    Tailwind CSS         │  │
│  │   Router    │  │   Build     │  │    + shadcn/ui          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API calls
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Serverless API (Vercel)                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Express.js Server                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐  │  │
│  │  │   Health   │  │  Exchange  │  │   Trigger Simulation │  │  │
│  │  │   Routes   │  │   Routes   │  │        Routes          │  │  │
│  │  └────────────┘  └────────────┘  └────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ Drizzle ORM Queries
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer (Neon PostgreSQL)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ CryptoAssets │  │   Exchange   │  │  SimulatedRates      │  │
│  │   (100+)     │  │  Providers   │  │   (79,200+ rows)     │  │
│  │              │  │    (8+)      │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Conversion History & Analytics               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 How It Works

### 1️⃣ Asset Selection
Choose from 100+ supported cryptocurrencies. The engine pre-loads live simulated rates for all available trading pairs.

### 2️⃣ Route Discovery
Yen's K-Shortest Paths algorithm explores direct and multi-hop routes:
```
BTC → ETH (Direct)
BTC → USDT → ETH (Multi-hop)
BTC → BNB → USDT → ETH (Complex)
```

### 3️⃣ Rate Optimization
Each path is scored by:
- **Exchange Rate** — Current simulated market rate
- **Provider Fees** — Each exchange's fee structure (0.1%–0.3%)
- **Path Depth** — Direct vs. multi-hop efficiency
- **Liquidity** — Real-time rate availability

### 4️⃣ Best Path Selection
The top 3 routes are ranked and returned with full breakdowns — provider, rate, fees, and estimated output.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI Components & State Management |
| **Styling** | Tailwind CSS + shadcn/ui | Modern, responsive design |
| **Build Tool** | Vite | Fast development & optimized builds |
| **Backend** | Express.js | RESTful API & Serverless Functions |
| **Database** | PostgreSQL (Neon) | Persistent data storage |
| **ORM** | Drizzle ORM | Type-safe database operations |
| **Auth** | Clerk | User authentication & authorization |
| **Deployment** | Vercel | Edge network & serverless hosting |
| **Simulation** | Custom GBM Engine | Price movement simulation |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Clerk account for authentication

### Installation

```bash
# Clone and install
git clone https://github.com/TheVijayVignesh/dex-aggregator.git
cd dex-aggregator && npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Simulation Secret
SIM_SECRET=your-secret-key
```

### Development

```bash
# Setup database
npm run db:push
npm run seed
npm run simulate-once

# Start development server
npm run dev
```

---

## 📦 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   git push origin main
   ```

2. **Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub

3. **Configure Environment Variables**
   - `DATABASE_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `SIM_SECRET`

4. **Deploy** — Vercel builds and deploys automatically

---

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/exchange/health` | System health & simulation status |
| `GET` | `/api/exchange/assets` | List all available crypto assets |
| `POST` | `/api/exchange/calculate-route` | Calculate optimal exchange routes |
| `GET` | `/api/exchange/trigger-simulation` | Trigger manual GBM simulation |

### Example: Calculate Route

```bash
curl -X POST https://your-app.vercel.app/api/exchange/calculate-route \
  -H "Content-Type: application/json" \
  -d '{"fromAsset":"BTC","toAsset":"ETH","amount":1}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bestPath": {
      "steps": [{"from":"BTC","to":"ETH","provider":"Binance","rate":15.23}],
      "totalFee": 0.15,
      "estimatedOutput": 15.08
    }
  }
}
```

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Route Calculation** | < 100ms for 100+ assets |
| **GBM Simulation** | 79,200 rates in < 2 seconds |
| **API Response** | < 50ms average |
| **Simulation Cadence** | 60s auto-refresh |

---

## 🗺️ Roadmap

- [ ] WebSocket real-time price updates
- [ ] User portfolio tracking & analytics
- [ ] Historical rate charts with TradingView
- [ ] Smart contract integration
- [ ] React Native mobile app

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

### Made with ❤️ for the crypto community

<p>
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Red%20Heart.png" width="40" />
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png" width="40" />
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Rocket.png" width="40" />
</p>

**Built for DBMS**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/TheVijayVignesh)

</div>

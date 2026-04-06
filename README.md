# DEX Aggregator

A decentralized exchange (DEX) aggregator that finds optimal trading routes across multiple cryptocurrency exchanges using advanced pathfinding algorithms.

## Features

- **Multi-Path Routing**: Uses Yen's K-Shortest Paths algorithm to find multiple optimal routes
- **Real-time Rate Simulation**: Geometric Brownian Motion (GBM) for price simulation
- **Advanced UI**: Modern React frontend with real-time updates
- **RESTful API**: Complete REST API for exchange operations
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Backend**: Node.js, Express, Drizzle ORM, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Database**: PostgreSQL with Neon
- **Authentication**: Clerk
- **Deployment**: Vercel ready

## Deploy to Vercel

1. Fork or clone this repository
2. Create a new project in Vercel and import this repository
3. Add environment variables: DATABASE_URL, VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
4. Click Deploy

## Environment Variables

Required environment variables for deployment:

- `DATABASE_URL`: PostgreSQL connection string
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `SIM_SECRET`: Secret for triggering simulations (optional)

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables from `.env.example`
4. Run database migrations: `npm run db:push`
5. Seed the database: `npm run seed`
6. Start development server: `npm run dev`

## API Endpoints

### Exchange Routes
- `GET /api/exchange/assets` - Get available crypto assets
- `POST /api/exchange/calculate-route` - Calculate optimal exchange routes
- `GET /api/exchange/health` - Get system health status
- `GET /api/exchange/trigger-simulation` - Trigger rate simulation (protected)

### Health Check
The health endpoint returns:
```json
{
  "status": "healthy" | "unhealthy",
  "simulationActive": boolean,
  "recentRateCount": number,
  "timestamp": string
}
```

## Architecture

The application uses a microservices architecture with:

- **Pathfinding Service**: Implements Yen's algorithm for multi-path routing
- **Rate Simulation**: GBM-based price simulation with configurable parameters
- **Repository Layer**: Abstracted data access with Drizzle ORM
- **Real-time Updates**: WebSocket connections for live rate updates

## License

MIT License - see LICENSE file for details

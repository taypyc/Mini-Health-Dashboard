# Mini Health Dashboard with AI Analysis

A full-stack health dashboard demonstrating React, Node.js, and Agentic AI (Model Context Protocol / MCP) integration. Structured as an npm workspaces monorepo and configured for deployment with **Vercel Services**.

---

## Architecture & Services

The project is structured into three distinct services:

```text
Mini-Health-Dashboard/
├── frontend/     # React + Vite SPA (Client UI)
├── backend/      # Express.js + TypeScript (API Gateway & MCP Client)
├── mcp-server/   # Model Context Protocol Server (AI Biomarker Tools)
├── vercel.json   # Vercel Services & Rewrites configuration
└── package.json  # Root workspaces & unified scripts
```

### 1. Frontend Service (`frontend/`)
- **Stack**: React 18, Vite, Tailwind CSS, Recharts, React Router.
- **Role**: Interactive patient dashboard displaying vitals, metabolic, and cardiovascular biomarkers.
- **Features**: Real-time metric simulation, charts, error boundaries (with `/503` service unavailable redirect), and automated code splitting (`manualChunks`).
- **Networking**: Requests `/api` via Vite development proxy (in dev) or relative path rewritten directly to the backend service (on Vercel). Configured via `VITE_API_URL`.

### 2. Backend Service (`backend/`)
- **Stack**: Express.js, TypeScript, Vitest, Supertest.
- **Role**: Secure API Gateway and data provider.
- **Endpoints**:
  - `GET /api/patients`: List all seeded patients.
  - `GET /api/patients/:id`: Get detailed patient profile.
  - `GET /api/patients/:id/biomarkers`: Query biomarkers by patient and category.
  - `POST /api/patients/:id/analyze`: Triggers AI analysis via the MCP server.
  - `GET /api/health`: Service health check.
- **MCP Client**: Spawns and communicates with `mcp-server` via `StdioClientTransport` with linked `InMemoryTransport` fallback.

### 3. MCP Server Service (`mcp-server/`)
- **Stack**: TypeScript, `@modelcontextprotocol/sdk`, Zod.
- **Role**: Dedicated Model Context Protocol server exposing AI tools:
  - `analyze_biomarkers`: Evaluates metrics against clinical target ranges and flags potential health risks (cardiovascular, diabetes, cardiac alerts).
  - `suggest_monitoring_priorities`: Computes deviations from reference bounds to recommend targeted biomarker monitoring priorities.
- **Communication**: Runs on `stdio` transport, connected to the backend client.

---

## Deployment Configuration (Vercel Services)

The project uses **Vercel Services** in `vercel.json` to build and deploy the polyglot monorepo atomically under a single deployment:

```json
{
  "services": {
    "frontend": {
      "root": "frontend",
      "framework": "vite"
    },
    "backend": {
      "root": "backend"
    },
    "mcp-server": {
      "root": "mcp-server"
    }
  },
  "rewrites": [
    {
      "source": "/api(/.*)?",
      "destination": {
        "type": "service",
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "type": "service",
        "service": "frontend"
      }
    }
  ]
}
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)

### Installation
Clone the repository and install all workspace dependencies from the root:

```bash
git clone https://github.com/taypyc/Mini-Health-Dashboard.git
cd Mini-Health-Dashboard
npm install
```

### Environment Variables
Copy `.env.example` to `.env` (or configure in `frontend/.env`):

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Base URL for frontend API calls. Proxied to backend in development. |
| `PORT` | `3001` | Local port for Express backend server. |

---

## Available Scripts

Run from the root directory:

### Development
Start the MCP server build, backend API, and Vite frontend dev server concurrently:
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

### Production Build
Builds all services in correct dependency sequence (`mcp-server` -> `backend` -> `frontend`):
```bash
npm run build
```

Individual service builds:
- `npm run build:mcp`: Compiles `mcp-server/src` to `mcp-server/dist` via `tsc`.
- `npm run build:backend`: Compiles `backend/src` to `backend/dist` via `tsc`.
- `npm run build:frontend`: Compiles Vite React app to `frontend/dist`.

### Running Tests
Execute unit and integration tests across services:

```bash
# Run backend tests (Vitest + Supertest)
npm test --prefix backend

# Run frontend tests (Vitest + React Testing Library + JSDOM)
npm test --prefix frontend
```

---

## Usage Flow
1. Open the frontend in your browser (`http://localhost:5173`).
2. Select a patient from the patient directory.
3. Click **"Get AI Insights"** to trigger the MCP biomarker analysis.
4. Toggle **"Live Updates"** to simulate real-time patient biomarker fluctuation.

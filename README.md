# Mini Health Dashboard with AI Analysis

A full-stack health dashboard demonstrating React, Node.js, and Agentic AI (MCP) integration.

## Features
- **Patient Dashboard**: View patients and their specific biomarker data.
- **AI Integration**: Uses the Model Context Protocol (MCP) to analyze biomarkers and suggest monitoring priorities.
- **Live Updates**: Simulates real-time data changes in the UI.

## Architecture
- **Backend**: Express.js + TypeScript.
  - Acts as the API Gateway.
  - Manages In-memory data store.
  - Connects to the MCP Server via `StdioClientTransport`.
- **MCP Server**: TypeScript + MCP SDK.
  - Runs as a separate process spawned by the Backend.
  - Provides `analyze_biomarkers` and `suggest_monitoring_priorities` tools.
- **Frontend**: React + Vite + Tailwind CSS.
  - Interactive UI with Recharts for visualization.
  - Polls Backend for "Live Updates" simulation.

## Setup & Run

### Prerequisites
- Node.js (v18+)

### Steps

1. **Build MCP Server**
   ```bash
   cd mcp-server
   npm install
   npx tsc
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm install
   npx ts-node src/server.ts or npm run start
   ```
   *Runs on http://localhost:3001*

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on http://localhost:5173* (or similar)

## Usage
1. Open the Frontend URL.
2. Select a patient.
3. Click **"Get AI Insights"** to trigger the MCP analysis.
4. Toggle **"Live Updates"** to see values change in real-time.

## Design Decisions
- **Monorepo-style** structure for clarity.
- **MCP Integration**: The Backend acts as the "Agent" client, calling the MCP server tools directly. This simplifies the frontend architecture and keeps the "Agentic" logic secure on the server side.
- **Data Seeding**: Random data generation on startup for testing variability.
  
## Tools
- Google Gemini Pro

import express from 'express';
import cors from 'cors';
import { patients, biomarkers } from './data';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// MCP Client Setup
let mcpClient: Client | null = null;

function getMcpServerPath(): string {
    const candidates = [
        path.resolve(process.cwd(), 'mcp-server/dist/index.js'),
        path.resolve(process.cwd(), 'dist/index.js'),
        path.resolve(__dirname, '../../mcp-server/dist/index.js'),
        path.resolve(__dirname, '../mcp-server/dist/index.js'),
        path.resolve(__dirname, '../../../mcp-server/dist/index.js')
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return candidates[0];
}

async function initMcpClient() {
    if (mcpClient) return mcpClient;

    const mcpPath = getMcpServerPath();
    console.log(`[Backend] Initializing MCP Client with path: ${mcpPath}`);

    try {
        const transport = new StdioClientTransport({
            command: "node",
            args: [mcpPath]
        });

        const client = new Client({
            name: "BackendClient",
            version: "1.0.0",
        }, {
            capabilities: {}
        });

        await client.connect(transport);
        mcpClient = client;
        console.log("Connected to MCP Server via stdio");
        return client;
    } catch (stdioErr) {
        console.warn("[Backend] Stdio transport failed, attempting in-memory fallback:", stdioErr);
        try {
            const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");
            // @ts-ignore
            const mcpModule = await import("../../mcp-server/src/index.js").catch(() => import("../../mcp-server/dist/index.js"));
            const mcpServer = mcpModule.server || mcpModule.default;

            const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
            await mcpServer.connect(serverTransport);

            const client = new Client({
                name: "BackendClient",
                version: "1.0.0",
            }, {
                capabilities: {}
            });

            await client.connect(clientTransport);
            mcpClient = client;
            console.log("Connected to MCP Server via in-memory transport");
            return client;
        } catch (inMemErr) {
            console.error("[Backend] In-memory MCP connection also failed:", inMemErr);
            throw stdioErr;
        }
    }
}

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'backend' });
});

// Get all patients
router.get('/patients', (req, res) => {
    res.json(patients);
});

// Get single patient
router.get('/patients/:id', (req, res) => {
    const patient = patients.find(p => p.id === req.params.id);
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
});

// Get biomarkers for a patient
router.get('/patients/:id/biomarkers', (req, res) => {
    const { id } = req.params;
    const { category } = req.query;

    let patientBiomarkers = biomarkers.filter(b => b.patientId === id);

    if (category) {
        patientBiomarkers = patientBiomarkers.filter(b => b.category === category);
    }

    res.json(patientBiomarkers);
});

// Analyze using MCP
router.post('/patients/:id/analyze', async (req, res) => {
    const { id } = req.params;
    const patient = patients.find(p => p.id === id);
    const patientBiomarkers = biomarkers.filter(b => b.patientId === id);

    if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
    }

    try {
        const client = await initMcpClient();

        // Call analyze_biomarkers tool
        const analyzeArgs = {
            biomarkers: patientBiomarkers.map(b => ({
                name: b.name,
                value: b.value,
                category: b.category,
                range: b.range
            }))
        };
        console.log("[Backend] Calling analyze_biomarkers with:", JSON.stringify(analyzeArgs, null, 2));

        const result = await client.callTool({
            name: "analyze_biomarkers",
            arguments: analyzeArgs
        });
        console.log("[Backend] analyze_biomarkers response:", JSON.stringify(result, null, 2));

        // Parse the result from MCP (Text content containing JSON)
        // @ts-ignore
        const textContent = result.content[0].text;
        const analysis = JSON.parse(textContent);

        // Call suggest_monitoring_priorities tool
        const suggestArgs = {
            biomarkers: patientBiomarkers.map(b => ({
                name: b.name,
                value: b.value,
                range: b.range
            }))
        };
        console.log("[Backend] Calling suggest_monitoring_priorities with:", JSON.stringify(suggestArgs, null, 2));

        const monitoringResult = await client.callTool({
            name: "suggest_monitoring_priorities",
            arguments: suggestArgs
        });
        console.log("[Backend] suggest_monitoring_priorities response:", JSON.stringify(monitoringResult, null, 2));
        // @ts-ignore
        const monitoringText = monitoringResult.content[0].text;

        // Normalized response
        const normalized = {
            summary: analysis.summary,
            risks: analysis.potentialRisks || [],
            recommendations: [monitoringText, ...analysis.concerns]
        };

        res.json(normalized);

    } catch (error) {
        console.error("MCP Analysis failed:", error);
        res.status(500).json({ error: "Analysis failed", details: String(error) });
    }
});

// Support both /api prefix and root router
app.use('/api', router);
app.use('/', router);

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        // Start MCP Client
        initMcpClient().catch(console.error);
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}

export { app };
export default app;

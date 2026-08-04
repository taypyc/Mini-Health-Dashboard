import express from 'express';
import cors from 'cors';
import { patients, biomarkers } from './data';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from 'path';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// MCP Client Setup
let mcpClient: Client | null = null;

async function initMcpClient() {
    if (mcpClient) return mcpClient;

    const transport = new StdioClientTransport({
        command: "node",
        args: [path.join(__dirname, '../../mcp-server/dist/index.js')]
    });

    const client = new Client({
        name: "BackendClient",
        version: "1.0.0",
    }, {
        capabilities: {}
    });

    await client.connect(transport);
    mcpClient = client;
    console.log("Connected to MCP Server");
    return client;
}

// Get all patients
app.get('/api/patients', (req, res) => {
    res.json(patients);
});

// Get single patient
app.get('/api/patients/:id', (req, res) => {
    const patient = patients.find(p => p.id === req.params.id);
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
});

// Get biomarkers for a patient
app.get('/api/patients/:id/biomarkers', (req, res) => {
    const { id } = req.params;
    const { category } = req.query;

    let patientBiomarkers = biomarkers.filter(b => b.patientId === id);

    if (category) {
        patientBiomarkers = patientBiomarkers.filter(b => b.category === category);
    }

    res.json(patientBiomarkers);
});

// Analyze using MCP
app.post('/api/patients/:id/analyze', async (req, res) => {
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

        // Merge results
        const finalResponse = {
            ...analysis,
            recommendations: [
                ...analysis.recommendations || [], // IF existing
                monitoringText
            ]
        };

        // Fallback normalization
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

// Export app for testing
export { app };

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        // Start MCP Client
        initMcpClient().catch(console.error);
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}

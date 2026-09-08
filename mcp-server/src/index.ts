import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server
const server = new McpServer({
    name: "BiomarkerAnalysisServer",
    version: "1.0.0",
});

// Helper to analyze a single biomarker
function analyzeValue(name: string, value: number, category: string, min: number, max: number) {
    if (value < min) return { status: 'low', concern: `${name} is below target range (${min}-${max})` };
    if (value > max) return { status: 'high', concern: `${name} is above target range (${min}-${max})` };
    return { status: 'normal', concern: null };
}

// Tool: Analyze Biomarkers
server.tool(
    "analyze_biomarkers",
    "Identify concerning values and potential health risks from biomarker data",
    {
        biomarkers: z.array(z.object({
            name: z.string(),
            value: z.number(),
            category: z.string(),
            range: z.object({ min: z.number(), max: z.number() })
        }))
    },
    async ({ biomarkers }) => {
        console.error("[MCP] analyze_biomarkers called with:", JSON.stringify(biomarkers, null, 2));

        const concerns: string[] = [];
        const risks: string[] = [];
        let abnormalCount = 0;

        biomarkers.forEach(b => {
            const analysis = analyzeValue(b.name, b.value, b.category, b.range.min, b.range.max);
            if (analysis.status !== 'normal') {
                concerns.push(analysis.concern!);
                abnormalCount++;

                // Simple risk heuristic
                if (b.name === 'Cholesterol' && analysis.status === 'high') risks.push("Cardiovascular Risk");
                if (b.name === 'Glucose' && analysis.status === 'high') risks.push("Diabetes Risk");
                if (b.name === 'Troponin' && analysis.status === 'high') risks.push("Immediate Cardiac Attention Needed");
            }
        });

        const summary = abnormalCount === 0
            ? "All biomarkers are within normal ranges."
            : `Found ${abnormalCount} abnormal biomarkers. Attention required.`;

        console.error("[MCP] analyze_biomarkers result:", summary, concerns, risks);

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    summary,
                    concerns,
                    potentialRisks: [...new Set(risks)] // Unique risks
                }, null, 2)
            }]
        };
    }
);

// Tool: Suggest Monitoring Priorities
server.tool(
    "suggest_monitoring_priorities",
    "Recommend which biomarkers need closer attention based on current values",
    {
        biomarkers: z.array(z.object({
            name: z.string(),
            value: z.number(),
            range: z.object({ min: z.number(), max: z.number() })
        }))
    },
    async ({ biomarkers }) => {
        console.error("[MCP] suggest_monitoring_priorities called with:", JSON.stringify(biomarkers, null, 2));

        const priorities: string[] = [];

        biomarkers.forEach(b => {
            const diff = Math.max(b.range.min - b.value, b.value - b.range.max);
            if (diff > 0) {
                // Simple priority logic: further from range = higher priority
                priorities.push(b.name);
            }
        });

        const resultText = `Recommended monitoring priorities: ${priorities.length > 0 ? priorities.join(', ') : 'Routine monitoring only'}.`;
        console.error("[MCP] suggest_monitoring_priorities result:", resultText);

        return {
            content: [{
                type: "text",
                text: resultText
            }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}

if (typeof require !== 'undefined' && require.main === module) {
    main().catch((error) => {
        console.error("Fatal error in main():", error);
        process.exit(1);
    });
} else if (typeof require === 'undefined') {
    main().catch((error) => {
        console.error("Fatal error in main():", error);
        process.exit(1);
    });
}

export { server };
export default server;



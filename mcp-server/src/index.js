"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
// Create server
const server = new mcp_js_1.McpServer({
    name: "BiomarkerAnalysisServer",
    version: "1.0.0",
});
exports.server = server;
// Helper to analyze a single biomarker
function analyzeValue(name, value, category, min, max) {
    if (value < min)
        return { status: 'low', concern: `${name} is below target range (${min}-${max})` };
    if (value > max)
        return { status: 'high', concern: `${name} is above target range (${min}-${max})` };
    return { status: 'normal', concern: null };
}
// Tool: Analyze Biomarkers
server.tool("analyze_biomarkers", "Identify concerning values and potential health risks from biomarker data", {
    biomarkers: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        value: zod_1.z.number(),
        category: zod_1.z.string(),
        range: zod_1.z.object({ min: zod_1.z.number(), max: zod_1.z.number() })
    }))
}, async ({ biomarkers }) => {
    console.error("[MCP] analyze_biomarkers called with:", JSON.stringify(biomarkers, null, 2));
    const concerns = [];
    const risks = [];
    let abnormalCount = 0;
    biomarkers.forEach(b => {
        const analysis = analyzeValue(b.name, b.value, b.category, b.range.min, b.range.max);
        if (analysis.status !== 'normal') {
            concerns.push(analysis.concern);
            abnormalCount++;
            // Simple risk heuristic
            if (b.name === 'Cholesterol' && analysis.status === 'high')
                risks.push("Cardiovascular Risk");
            if (b.name === 'Glucose' && analysis.status === 'high')
                risks.push("Diabetes Risk");
            if (b.name === 'Troponin' && analysis.status === 'high')
                risks.push("Immediate Cardiac Attention Needed");
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
});
// Tool: Suggest Monitoring Priorities
server.tool("suggest_monitoring_priorities", "Recommend which biomarkers need closer attention based on current values", {
    biomarkers: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        value: zod_1.z.number(),
        range: zod_1.z.object({ min: zod_1.z.number(), max: zod_1.z.number() })
    }))
}, async ({ biomarkers }) => {
    console.error("[MCP] suggest_monitoring_priorities called with:", JSON.stringify(biomarkers, null, 2));
    const priorities = [];
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
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}
if (typeof require !== 'undefined' && require.main === module) {
    main().catch((error) => {
        console.error("Fatal error in main():", error);
        process.exit(1);
    });
}
else if (typeof require === 'undefined') {
    main().catch((error) => {
        console.error("Fatal error in main():", error);
        process.exit(1);
    });
}
exports.default = server;

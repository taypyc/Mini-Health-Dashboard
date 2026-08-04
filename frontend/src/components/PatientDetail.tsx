import { useEffect, useState } from 'react';
import { api, Biomarker, Patient, AnalysisResult } from '../api';
import { ArrowLeft, Activity, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import { useParams, useNavigate } from 'react-router-dom';

export function PatientDetail() {
    const { id: patientId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [liveMode, setLiveMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!patientId) return;
            try {
                const [p, b] = await Promise.all([
                    api.getPatient(patientId),
                    api.getBiomarkers(patientId)
                ]);
                setPatient(p);
                setBiomarkers(b);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [patientId]);

    // Live updates simulation
    useEffect(() => {
        if (!liveMode) return;
        const interval = setInterval(() => {
            setBiomarkers(prev => prev.map(b => {
                if (Math.random() > 0.8) { // Update 20% of markers occasionally
                    const change = (Math.random() - 0.5) * (b.range.max - b.range.min) * 0.1;
                    const newValue = Number((b.value + change).toFixed(1));
                    // Recalculate status locally for UI instant feedback
                    let status = b.status;
                    if (newValue > b.range.max) status = 'high';
                    else if (newValue < b.range.min) status = 'low';
                    else status = 'normal';
                    return { ...b, value: newValue, status };
                }
                return b;
            }));
        }, 2500);
        return () => clearInterval(interval);
    }, [liveMode]);

    const handleAnalyze = async () => {
        if (!patientId) return;
        setAnalyzing(true);
        try {
            const result = await api.analyzePatient(patientId);
            setAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    const filteredBiomarkers = categoryFilter === 'all'
        ? biomarkers
        : biomarkers.filter(b => b.category === categoryFilter);

    const chartData = filteredBiomarkers.map(b => ({
        name: b.name,
        value: b.value,
        min: b.range.min,
        max: b.range.max
    }));

    if (loading) return <div className="p-8">Loading...</div>;
    if (!patient) return <div className="p-8">Patient not found</div>;

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    aria-label="Back to patient list"
                >
                    <ArrowLeft size={20} aria-hidden="true" />
                    <span>Back to List</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span id="live-updates-label" className="text-sm font-medium text-slate-700">Live Updates</span>
                        <button
                            onClick={() => setLiveMode(!liveMode)}
                            aria-labelledby="live-updates-label"
                            aria-pressed={liveMode}
                            className={clsx("w-12 h-6 rounded-full transition-colors relative cursor-pointer", liveMode ? "bg-green-500" : "bg-slate-300")}
                        >
                            <div className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm", liveMode ? "left-7" : "left-1")} />
                        </button>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        aria-busy={analyzing}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
                    >
                        {analyzing ? <RefreshCw className="animate-spin" size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
                        <span>Get AI Insights</span>
                    </button>
                </div>
            </div>


            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" aria-labelledby="patient-name">
                <h1 id="patient-name" className="text-3xl font-bold text-slate-900">{patient.name}</h1>
                <div className="flex gap-6 mt-2 text-slate-500">
                    <span><span className="sr-only">Date of Birth: </span>{patient.dateOfBirth}</span>
                    <span><span className="sr-only">Last Visit: </span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                    <span><span className="sr-only">Patient ID: </span>{patient.id}</span>
                </div>
            </div>


            {analysis && (
                <div
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm animate-slideDown"
                    aria-live="polite"
                    role="region"
                    aria-labelledby="ai-analysis-title"
                >
                    <h3 id="ai-analysis-title" className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                        <Sparkles size={20} className="text-indigo-600" aria-hidden="true" />
                        AI Analysis
                    </h3>
                    <p className="mt-2 text-indigo-800">{analysis.summary}</p>
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                        {analysis.risks.length > 0 && (
                            <div className="bg-white/60 p-4 rounded-lg">
                                <h4 className="font-semibold text-rose-700 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} aria-hidden="true" /> Potential Risks
                                </h4>
                                <ul className="list-disc list-inside text-rose-800 text-sm">
                                    {analysis.risks.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="bg-white/60 p-4 rounded-lg">
                            <h4 className="font-semibold text-teal-700 mb-2">Recommendations</h4>
                            <ul className="list-disc list-inside text-teal-800 text-sm">
                                {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}


            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex gap-2" role="group" aria-label="Filter biomarkers by category">
                        {['all', 'metabolic', 'cardiovascular', 'hormonal'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                aria-pressed={categoryFilter === cat}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors cursor-pointer",
                                    categoryFilter === cat ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left" aria-label="Patient biomarkers">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 font-medium" scope="col">Biomarker</th>
                                    <th className="p-4 font-medium" scope="col">Value</th>
                                    <th className="p-4 font-medium" scope="col">Reference Range</th>
                                    <th className="p-4 font-medium" scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody aria-live="polite">
                                {filteredBiomarkers.map((b) => (
                                    <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-medium text-slate-900">{b.name}</td>
                                        <td className="p-4">
                                            <span className="font-bold">{b.value}</span> <span className="text-slate-400 text-xs">{b.unit}</span>
                                        </td>
                                        <td className="p-4 text-slate-500">{b.range.min} - {b.range.max}</td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                                b.status === 'normal' && "bg-emerald-100 text-emerald-700",
                                                b.status === 'high' && "bg-amber-100 text-amber-700",
                                                b.status === 'low' && "bg-blue-100 text-blue-700",
                                            )} aria-label={`Status: ${b.status}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                <div className="space-y-4 min-w-0" aria-hidden="true">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full min-h-[400px]">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-blue-500" />
                            Current Levels (Visual Chart)
                        </h3>
                        <div className="h-[300px] w-full min-w-0">
                            <ResponsiveContainer width="99%" height="100%" debounce={200}>
                                <LineChart data={chartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="min" stroke="#cbd5e1" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                                    <Line type="monotone" dataKey="max" stroke="#cbd5e1" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                                </LineChart>
                            </ResponsiveContainer>
                            <p className="text-center text-xs text-slate-400 mt-4">Values vs Reference Range (Min/Max dashed)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

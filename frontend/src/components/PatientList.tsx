import { useEffect, useState } from 'react';
import { api, Patient } from '../api';
import { User, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PatientList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getPatients()
            .then(setPatients)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="p-8 text-center text-slate-500" aria-live="polite" aria-busy="true">
            Loading patients...
        </div>
    );

    return (
        <div className="space-y-6">
            {patients.length > 0 && (<h2 className="text-2xl font-bold text-slate-800">Patients</h2>)}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
                {patients.map(patient => (
                    <Link
                        key={patient.id}
                        to={`/patients/${patient.id}`}
                        className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group block"
                        aria-label={`View details for patient ${patient.name}, ID ${patient.id}`}
                        role="listitem"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center" aria-hidden="true">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                                    <p className="text-xs text-slate-500">ID: {patient.id}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500" aria-hidden="true" />
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar size={14} className="text-slate-400" aria-hidden="true" />
                                <span><span className="sr-only">Date of Birth: </span>{patient.dateOfBirth}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock size={14} className="text-slate-400" aria-hidden="true" />
                                <span><span className="sr-only">Last Visit: </span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

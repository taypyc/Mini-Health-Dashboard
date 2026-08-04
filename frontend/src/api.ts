import { NavigateFunction } from 'react-router-dom';
import { API_Base } from './constants';

// Ideally, shared types should be in a shared package or copied. 
// For this task, I will redefine them here to avoid path issues if directories are strict.
export type BiomarkerCategory = 'metabolic' | 'cardiovascular' | 'hormonal';
export type BiomarkerStatus = 'normal' | 'high' | 'low';

export interface Biomarker {
    id: string;
    patientId: string;
    name: string;
    value: number;
    unit: string;
    category: BiomarkerCategory;
    range: {
        min: number;
        max: number;
    };
    measuredAt: string;
    status: BiomarkerStatus;
}

export interface Patient {
    id: string;
    name: string;
    dateOfBirth: string;
    lastVisit: string;
}

export interface AnalysisResult {
    summary: string;
    risks: string[];
    recommendations: string[];
}

let navigate: NavigateFunction | null = null;

export const setNavigate = (fn: NavigateFunction) => {
    navigate = fn;
};

const request = async (url: string, options?: RequestInit) => {
    try {
        const res = await fetch(url, options);
        if (res.status === 503 || res.status === 500) {
            if (navigate) {
                navigate('/503');
            } else {
                window.location.href = '/503';
            }
            throw new Error('Service Unavailable');
        }
        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }
        return res.json();
    } catch (e) {
        console.error("API Call failed", e);
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
            if (navigate) {
                navigate('/503');
            } else {
                window.location.href = '/503';
            }
        }
        throw e;
    }
};

export const api = {
    getPatients: async (): Promise<Patient[]> => {
        return request(`${API_Base}/patients`);
    },
    getPatient: async (id: string): Promise<Patient> => {
        return request(`${API_Base}/patients/${id}`);
    },
    getBiomarkers: async (patientId: string, category?: string): Promise<Biomarker[]> => {
        let url = `${API_Base}/patients/${patientId}/biomarkers`;
        if (category) url += `?category=${category}`;
        return request(url);
    },
    analyzePatient: async (patientId: string): Promise<AnalysisResult> => {
        return request(`${API_Base}/patients/${patientId}/analyze`, { method: 'POST' });
    }
};

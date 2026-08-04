import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './server';

describe('Backend API', () => {
    let testPatientId: string;

    describe('GET /api/patients', () => {
        it('should return a list of patients', async () => {
            const response = await request(app).get('/api/patients');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
            testPatientId = response.body[0].id;
        });
    });

    describe('GET /api/patients/:id', () => {
        it('should return a single patient by ID', async () => {
            const response = await request(app).get(`/api/patients/${testPatientId}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(testPatientId);
        });

        it('should return 404 for non-existent patient', async () => {
            const response = await request(app).get('/api/patients/NONEXISTENT');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Patient not found');
        });
    });

    describe('GET /api/patients/:id/biomarkers', () => {
        it('should return biomarkers for a patient', async () => {
            const response = await request(app).get(`/api/patients/${testPatientId}/biomarkers`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].patientId).toBe(testPatientId);
        });

        it('should filter biomarkers by category', async () => {
            // Get a category from the first biomarker to be sure it exists
            const allBiomarkers = await request(app).get(`/api/patients/${testPatientId}/biomarkers`);
            const category = allBiomarkers.body[0].category;

            const response = await request(app).get(`/api/patients/${testPatientId}/biomarkers?category=${category}`);
            expect(response.status).toBe(200);
            expect(response.body.every((b: any) => b.category === category)).toBe(true);
        });
    });
});

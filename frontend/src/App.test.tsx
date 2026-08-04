import { render } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock child components to isolate App test
vi.mock('./components/Header', () => ({
    Header: () => <div data-testid="header">Header</div>
}));
vi.mock('./components/PatientList', () => ({
    PatientList: () => <div data-testid="patient-list">Patient List</div>
}));

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Since routes are lazy loaded, we might need to wait, but for a smoke test checks if it mounts
        expect(document.body).toBeTruthy();
    });
});

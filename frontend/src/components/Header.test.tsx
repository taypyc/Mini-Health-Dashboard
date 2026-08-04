import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('Header', () => {
    it('renders the application title', () => {
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText('HealthDashboard')).toBeInTheDocument();
    });

    it('renders the doctor name', () => {
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });
});

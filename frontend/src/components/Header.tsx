import { Link, useLocation } from 'react-router-dom';

export function Header() {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
            {isHomePage ? (
                <div className="flex items-center gap-2" aria-label="HealthDashboard Home">
                    <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg" aria-hidden="true">H</span>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">HealthDashboard</span>
                </div>
            ) : (
                <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity" aria-label="Go to HealthDashboard Home">
                    <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg" aria-hidden="true">H</span>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">HealthDashboard</span>
                </Link>
            )}
            <div className="flex items-center gap-4" aria-label="User profile">
                <div className="text-sm font-medium text-slate-500">Dr. Smith</div>
                <div className="w-8 h-8 rounded-full bg-slate-200" role="img" aria-label="Dr. Smith's avatar"></div>
            </div>
        </header>
    );
}

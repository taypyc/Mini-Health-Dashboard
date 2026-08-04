import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-slate-100 p-4 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-slate-500" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
            <p className="text-slate-500 max-w-md mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
                Go back home
            </Link>
        </div>
    );
}

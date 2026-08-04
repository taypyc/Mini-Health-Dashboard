import { ServerOff } from 'lucide-react';

export function ServiceUnavailable() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-amber-50 p-4 rounded-full mb-6">
                <ServerOff className="w-12 h-12 text-amber-500" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">503</h1>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Service Unavailable</h2>
            <p className="text-slate-500 max-w-md mb-8">
                We're experiencing some technical difficulties. Please try again later.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
                Reload page
            </button>
        </div>
    );
}

import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { setNavigate } from './api';

const PatientList = lazy(() => import('./components/PatientList').then(module => ({ default: module.PatientList })));
const PatientDetail = lazy(() => import('./components/PatientDetail').then(module => ({ default: module.PatientDetail })));
const NotFound = lazy(() => import('./components/NotFound').then(module => ({ default: module.NotFound })));
const ServiceUnavailable = lazy(() => import('./components/ServiceUnavailable').then(module => ({ default: module.ServiceUnavailable })));

function NavigationHandler() {
  const navigate = useNavigate();
  console.log(navigate)
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <NavigationHandler />
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          <Suspense fallback={<div className="flex items-center justify-center p-8 text-slate-500">Loading...</div>}>
            <Routes>
              <Route path="/" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/503" element={<ServiceUnavailable />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;

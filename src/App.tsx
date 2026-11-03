import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { Navbar } from './components/layout/Navbar';
import { HealthAlertBanner } from './components/layout/HealthAlertBanner';
import { ConnectionModal } from './components/layout/ConnectionModal';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/ui/Toast';
import { Loader2 } from 'lucide-react';

const DetectPage = lazy(() => import('./pages/DetectPage').then((m) => ({ default: m.DetectPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const StatsPage = lazy(() => import('./pages/StatsPage').then((m) => ({ default: m.StatsPage })));
const PestsPage = lazy(() => import('./pages/PestsPage').then((m) => ({ default: m.PestsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
      <p className="text-xs font-medium">Đang tải trang...</p>
    </div>
  );
}

export function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
          <Navbar />
          <HealthAlertBanner />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<DetectPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/pests" element={<PestsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />

          {/* Persistent Dialogs and Alerts */}
          <ConnectionModal />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

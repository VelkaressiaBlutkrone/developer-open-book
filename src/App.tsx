import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { routes } from './routes';

const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            {routes.map((r) => (
              <Route key={r.path} path={r.path} element={<r.component />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
}



// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from 'react-hot-toast';

// import App from './App';
// import './index.css';

// import useThemeStore from './store/themeStore';
// import { initCsrf } from './services/api';

// const qc = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnWindowFocus: false,
//       staleTime: 5 * 60 * 1000,
//     },
//   },
// });

// const BASE = {
//   fontFamily: 'Inter, Tajawal, sans-serif',
//   fontSize: 13,
//   fontWeight: 500,
//   lineHeight: 1.5,
//   borderRadius: 12,
//   padding: '11px 15px',
//   minWidth: 240,
//   maxWidth: 360,
//   display: 'flex',
//   alignItems: 'center',
//   gap: 10,
//   boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
//   backdropFilter: 'blur(12px)',
//   WebkitBackdropFilter: 'blur(12px)',
//   border: '1px solid',
//   // theme-adaptive base — overridden per type below
//   background: 'var(--bg-primary)',
//   color: 'var(--text-primary)',
//   borderColor: 'var(--border)',
// };

// async function bootstrap() {
//   useThemeStore.getState().init();
//   await initCsrf();

//   ReactDOM.createRoot(document.getElementById('root')).render(
//     <React.StrictMode>
//       <QueryClientProvider client={qc}>
//         <BrowserRouter>
//           <App />

//           <Toaster
//             position="bottom-right"
//             gutter={8}
//             containerStyle={{ bottom: 24, right: 24 }}
//             toastOptions={{
//               duration: 4000,

//               // ── Default (blank / info) ──────────────────
//               style: {
//                 ...BASE,
//               },

//               // ── Success ─────────────────────────────────
//               success: {
//                 duration: 3500,
//                 style: {
//                   ...BASE,
//                   background: 'var(--bg-primary)',
//                   color: '#16a34a',
//                   borderColor: 'rgba(34,197,94,0.30)',
//                   boxShadow: '0 4px 16px rgba(34,197,94,0.10), 0 1px 4px rgba(0,0,0,0.06)',
//                 },
//                 iconTheme: {
//                   primary: '#22c55e',
//                   secondary: 'var(--bg-primary)',
//                 },
//               },

//               // ── Error ───────────────────────────────────
//               error: {
//                 duration: 5000,
//                 style: {
//                   ...BASE,
//                   background: 'var(--bg-primary)',
//                   color: '#dc2626',
//                   borderColor: 'rgba(239,68,68,0.30)',
//                   boxShadow: '0 4px 16px rgba(239,68,68,0.10), 0 1px 4px rgba(0,0,0,0.06)',
//                 },
//                 iconTheme: {
//                   primary: '#ef4444',
//                   secondary: 'var(--bg-primary)',
//                 },
//               },

//               // ── Loading ─────────────────────────────────
//               loading: {
//                 style: {
//                   ...BASE,
//                   background: 'var(--bg-primary)',
//                   color: 'var(--text-secondary)',
//                   borderColor: 'var(--border)',
//                 },
//                 iconTheme: {
//                   primary: '#BD8E50',      // brand gold
//                   secondary: 'var(--bg-primary)',
//                 },
//               },
//             }}
//           />

//         </BrowserRouter>
//       </QueryClientProvider>
//     </React.StrictMode>
//   );
// }

// bootstrap();


import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import useThemeStore from './store/themeStore';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const BASE = {
  fontFamily: 'Inter, Tajawal, sans-serif',
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.5,
  borderRadius: 12,
  padding: '11px 15px',
  minWidth: 240,
  maxWidth: 360,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border)',
};

async function bootstrap() {
  useThemeStore.getState().init(); // ✅ بقي — مهم للثيم

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <App />
          <Toaster
            position="bottom-right"
            gutter={8}
            containerStyle={{ bottom: 24, right: 24 }}
            toastOptions={{
              duration: 4000,
              style: { ...BASE },
              success: {
                duration: 3500,
                style: {
                  ...BASE,
                  background: 'var(--bg-primary)',
                  color: '#16a34a',
                  borderColor: 'rgba(34,197,94,0.30)',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                },
                iconTheme: { primary: '#22c55e', secondary: 'var(--bg-primary)' },
              },
              error: {
                duration: 5000,
                style: {
                  ...BASE,
                  background: 'var(--bg-primary)',
                  color: '#dc2626',
                  borderColor: 'rgba(239,68,68,0.30)',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                },
                iconTheme: { primary: '#ef4444', secondary: 'var(--bg-primary)' },
              },
              loading: {
                style: {
                  ...BASE,
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border)',
                },
                iconTheme: { primary: '#BD8E50', secondary: 'var(--bg-primary)' },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

bootstrap();

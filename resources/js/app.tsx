import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { DialogProvider } from './components/GlobalDialog';

const appName = import.meta.env.VITE_APP_NAME || 'SistemDekor';
const queryClient = new QueryClient();

// Set default headers for Axios
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Initialize CSRF token for Sanctum API authentication
axios.get('/sanctum/csrf-cookie').catch(() => {
    // Ignore errors, just try to get the cookie
});

createInertiaApp({
    title: (title) => 'Ade Decoration',
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <QueryClientProvider client={queryClient}>
                <DialogProvider>
                    <App {...props} />
                </DialogProvider>
            </QueryClientProvider>,
        );
    },
    progress: {
        color: '#D4AF37',
    },
});

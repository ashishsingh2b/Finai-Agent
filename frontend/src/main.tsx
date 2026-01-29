import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Bootstrap i18next engine

// Hydrate root element with StrictMode for development audit capabilities
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);


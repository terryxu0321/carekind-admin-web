import '@carekind/shared/tokens.css';
import './styles/app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { AuthProvider } from './auth/AuthContext';
import { readStoredSession } from './auth/session';
import { ToastProvider } from './components/Toast';
import { API_BASE_URL } from './config';

const rootElement = document.getElementById('root');
if (rootElement === null) {
	throw new Error('index.html is missing the #root element');
}

createRoot(rootElement).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider baseUrl={API_BASE_URL} initialSession={readStoredSession()}>
				<ToastProvider>
					<AppRoutes />
				</ToastProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>,
);

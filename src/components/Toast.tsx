// DESIGN.md toast: one at a time, 4 seconds, only for results that already happened
// ("Facility saved"). Errors that need action are shown inline or in a banner instead.
import {
	type ReactElement,
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';

const TOAST_DURATION_MS = 4000;

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
	const [message, setMessage] = useState<string | null>(null);
	const showToast = useCallback((next: string) => setMessage(next), []);

	useEffect(() => {
		if (message === null) {
			return undefined;
		}
		const timer = window.setTimeout(() => setMessage(null), TOAST_DURATION_MS);
		return () => window.clearTimeout(timer);
	}, [message]);

	return (
		<ToastContext.Provider value={showToast}>
			{children}
			<div className="ck-toast-region" role="status">
				{message === null ? null : (
					<p className="ck-toast">
						<span className="ck-toast__icon" aria-hidden="true">
							✓
						</span>
						{message}
					</p>
				)}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast(): ShowToast {
	const showToast = useContext(ToastContext);
	if (showToast === null) {
		throw new Error('useToast must be used inside <ToastProvider>');
	}
	return showToast;
}

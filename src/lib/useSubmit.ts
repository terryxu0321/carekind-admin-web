// Busy and error state for one form's submit. Errors stay on screen (inline), never in a toast.
import { useCallback, useState } from 'react';
import { errorMessage } from './errors';

export interface SubmitState {
	isSubmitting: boolean;
	error: string | null;
	run: (action: () => Promise<void>) => Promise<void>;
	setError: (message: string | null) => void;
}

export function useSubmit(): SubmitState {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const run = useCallback(async (action: () => Promise<void>) => {
		setIsSubmitting(true);
		setError(null);
		try {
			await action();
		} catch (cause) {
			setError(errorMessage(cause));
		} finally {
			setIsSubmitting(false);
		}
	}, []);

	return { isSubmitting, error, run, setError };
}

// Loads data for a page and exposes loading / error / ready states for the empty-loading-error UI.
import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from './errors';

export type LoadState<T> =
	{ status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T };

export interface LoadResult<T> {
	state: LoadState<T>;
	reload: () => void;
	// Swap in data returned by a save, so the page does not need another request.
	replace: (data: T) => void;
}

// `loader` must be stable (wrap it in useCallback); a new loader triggers a new request.
export function useLoad<T>(loader: () => Promise<T>): LoadResult<T> {
	const [state, setState] = useState<LoadState<T>>({ status: 'loading' });
	const [version, setVersion] = useState(0);

	useEffect(() => {
		let isCurrent = true;
		loader().then(
			(data) => {
				if (isCurrent) {
					setState({ status: 'ready', data });
				}
			},
			(error: unknown) => {
				if (isCurrent) {
					setState({ status: 'error', message: errorMessage(error) });
				}
			},
		);
		return () => {
			isCurrent = false;
		};
	}, [loader, version]);

	const reload = useCallback(() => setVersion((current) => current + 1), []);
	const replace = useCallback((data: T) => setState({ status: 'ready', data }), []);
	return { state, reload, replace };
}

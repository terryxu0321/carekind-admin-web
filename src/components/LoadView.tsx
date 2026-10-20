// Renders the loading and error states of a useLoad result, and the page once data is ready.
import type { ReactElement, ReactNode } from 'react';
import type { LoadResult } from '../lib/useLoad';
import { ErrorBanner, Loading } from './Feedback';

interface LoadViewProps<T> {
	result: LoadResult<T>;
	loadingLabel: string;
	children: (data: T) => ReactNode;
}

export function LoadView<T>({ result, loadingLabel, children }: LoadViewProps<T>): ReactElement {
	const { state, reload } = result;
	if (state.status === 'loading') {
		return <Loading label={loadingLabel} />;
	}
	if (state.status === 'error') {
		return <ErrorBanner message={state.message} onRetry={reload} />;
	}
	return <>{children(state.data)}</>;
}

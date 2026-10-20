// DESIGN.md feedback: system-banner-error (persistent, role=alert), loading spinner with text,
// empty-state, and a neutral notice. None of these ever express a resident's clinical state.
import type { ReactElement, ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBannerProps {
	message: string;
	onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps): ReactElement {
	return (
		<div className="ck-banner ck-banner--error" role="alert">
			<span className="ck-banner__icon" aria-hidden="true">
				!
			</span>
			<p className="ck-banner__text">{message}</p>
			{onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
		</div>
	);
}

// A neutral prompt that needs the reader's attention (e.g. re-confirm consent); not a status colour.
export function Notice({ title, children }: { title: string; children: ReactNode }): ReactElement {
	return (
		<div className="ck-notice" role="status">
			<p className="ck-notice__title">
				<span aria-hidden="true">ⓘ </span>
				{title}
			</p>
			<div>{children}</div>
		</div>
	);
}

export function Loading({ label }: { label: string }): ReactElement {
	return (
		<div className="ck-loading" role="status">
			<span className="ck-spinner" aria-hidden="true" />
			<span>{label}</span>
		</div>
	);
}

interface EmptyStateProps {
	title: string;
	body: string;
	action?: ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps): ReactElement {
	return (
		<div className="ck-empty">
			<p className="ck-empty__title">{title}</p>
			<p className="ck-empty__body">{body}</p>
			{action ?? null}
		</div>
	);
}

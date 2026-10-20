// Help and error text under a control (DESIGN.md input-error: icon + text, never colour alone).
import type { ReactElement } from 'react';

export function describedBy(id: string, help?: string, error?: string): string | undefined {
	const ids = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean);
	return ids.length > 0 ? ids.join(' ') : undefined;
}

interface FieldMessagesProps {
	id: string;
	help?: string;
	error?: string;
}

export function FieldMessages({ id, help, error }: FieldMessagesProps): ReactElement {
	return (
		<>
			{help ? (
				<p id={`${id}-help`} className="ck-help">
					{help}
				</p>
			) : null}
			{error ? (
				<p id={`${id}-error`} className="ck-field-error">
					<span aria-hidden="true">! </span>
					{error}
				</p>
			) : null}
		</>
	);
}

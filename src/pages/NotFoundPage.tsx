import type { ReactElement } from 'react';
import { ButtonLink } from '../components/Button';
import { EmptyState } from '../components/Feedback';

export function NotFoundPage(): ReactElement {
	return (
		<EmptyState
			title="Page not found"
			body="The address may be mistyped, or the page has moved."
			action={<ButtonLink to="/">Go to overview</ButtonLink>}
		/>
	);
}

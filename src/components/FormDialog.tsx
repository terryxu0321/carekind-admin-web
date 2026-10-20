// A dialog that holds exactly one form with one submit (DESIGN.md §7.3 form rule).
import type { FormEvent, ReactElement, ReactNode } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { ErrorBanner } from './Feedback';

interface FormDialogProps {
	title: string;
	// Verb naming the action, e.g. "Record event" — never "Submit" or "OK".
	submitLabel: string;
	cancelLabel?: string;
	onSubmit: () => void;
	onClose: () => void;
	isSubmitting: boolean;
	error: string | null;
	children: ReactNode;
}

export function FormDialog({
	title,
	submitLabel,
	cancelLabel = 'Cancel',
	onSubmit,
	onClose,
	isSubmitting,
	error,
	children,
}: FormDialogProps): ReactElement {
	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		onSubmit();
	};
	return (
		<Dialog title={title} onClose={onClose}>
			<form className="ck-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
				{error ? <ErrorBanner message={error} /> : null}
				{children}
				<div className="ck-dialog__actions">
					<Button type="submit" variant="primary" disabled={isSubmitting}>
						{submitLabel}
					</Button>
					<Button onClick={onClose}>{cancelLabel}</Button>
				</div>
			</form>
		</Dialog>
	);
}

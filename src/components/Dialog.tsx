// DESIGN.md dialog: scrim + canvas card, title says the question, body says the consequence.
// Focus moves into the dialog on open and back to the trigger on close; Escape closes it.
import { type ReactElement, type ReactNode, useEffect, useId, useRef } from 'react';

interface DialogProps {
	title: string;
	onClose: () => void;
	children: ReactNode;
}

const FOCUSABLE = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';

export function Dialog({ title, onClose, children }: DialogProps): ReactElement {
	const titleId = useId();
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const trigger = document.activeElement;
		const firstFocusable = cardRef.current?.querySelector<HTMLElement>(FOCUSABLE);
		(firstFocusable ?? cardRef.current)?.focus();
		return () => {
			if (trigger instanceof HTMLElement) {
				trigger.focus();
			}
		};
	}, []);

	return (
		<div className="ck-dialog-scrim">
			<div
				ref={cardRef}
				className="ck-dialog"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
				onKeyDown={(event) => {
					if (event.key === 'Escape') {
						onClose();
					}
				}}
			>
				<h2 id={titleId} className="ck-dialog__title">
					{title}
				</h2>
				{children}
			</div>
		</div>
	);
}

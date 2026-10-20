// DESIGN.md status-tag: a non-interactive pill for RECORD or SYSTEM state only (e.g. facility
// go-live status). Never used for a resident's risk, condition or priority (TGA, hazard H-18).
import type { ReactElement } from 'react';

export type StatusTone = 'confirmed' | 'draft' | 'error' | 'offline';

const TONE_ICON: Record<StatusTone, string> = {
	confirmed: '✓',
	draft: '◌',
	error: '!',
	offline: '–',
};

export function StatusTag({ tone, label }: { tone: StatusTone; label: string }): ReactElement {
	return (
		<span className={`ck-tag ck-tag--${tone}`}>
			<span className="ck-tag__icon" aria-hidden="true">
				{TONE_ICON[tone]}
			</span>
			{label}
		</span>
	);
}

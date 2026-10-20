// Plain-English text for go-live blockers computed by the shared canActivateFacility rule.
import { type GoLiveBlocker, NSW_STAFF_NOTICE_DAYS } from '@carekind/shared';
import { formatDate } from '../../lib/format';
import { GO_LIVE_ITEM_LABELS } from '../../lib/labels';

export function blockerText(blocker: GoLiveBlocker): string {
	switch (blocker.kind) {
		case 'item_incomplete':
			return `${GO_LIVE_ITEM_LABELS[blocker.key]} is not complete.`;
		case 'notice_date_missing':
			return 'Record the date written notice was given to staff.';
		case 'notice_period_not_met':
			return `NSW requires ${NSW_STAFF_NOTICE_DAYS} days of written notice to staff. Recording can start on ${formatDate(blocker.earliestActivationDate)}.`;
	}
}

export function blockerKey(blocker: GoLiveBlocker): string {
	return blocker.kind === 'item_incomplete' ? `${blocker.kind}-${blocker.key}` : blocker.kind;
}

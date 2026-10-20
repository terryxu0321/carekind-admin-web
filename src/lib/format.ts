// Display formats from DESIGN.md §7.3 date-time-input: DD/MM/YYYY and 24-hour HH:MM.
import type { IsoDate, IsoDateTime } from '@carekind/shared';

export const NOT_SET = '—';

export function formatDate(value: IsoDate | null): string {
	if (value === null) {
		return NOT_SET;
	}
	const [year, month, day] = value.split('-');
	return `${day}/${month}/${year}`;
}

export function formatDateTime(value: IsoDateTime | null): string {
	if (value === null) {
		return NOT_SET;
	}
	return new Date(value).toLocaleString('en-AU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
}

// A ratio of 0–1 as a whole percentage; null means there is nothing to divide by.
export function formatPercent(ratio: number | null, emptyText: string): string {
	return ratio === null ? emptyText : `${Math.round(ratio * 100)}%`;
}

export function rateOrNull(part: number, whole: number): number | null {
	return whole === 0 ? null : part / whole;
}

export interface PersonName {
	givenName: string;
	familyName: string;
	preferredName?: string | null;
}

export function formatPersonName(person: PersonName): string {
	const preferred = person.preferredName ? ` (${person.preferredName})` : '';
	return `${person.givenName}${preferred} ${person.familyName}`;
}

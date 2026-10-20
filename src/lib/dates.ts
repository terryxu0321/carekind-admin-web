// Local calendar helpers for form inputs. Business date rules live in @carekind/shared.
import type { IsoDate, IsoDateTime } from '@carekind/shared';

function pad(value: number): string {
	return String(value).padStart(2, '0');
}

// Today's date in the user's time zone, as the YYYY-MM-DD the shared rules expect.
export function todayIso(now: Date = new Date()): IsoDate {
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Value for <input type="datetime-local"> ("YYYY-MM-DDTHH:MM", local time).
export function localDateTimeValue(now: Date = new Date()): string {
	return `${todayIso(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// datetime-local values carry no zone; convert to an ISO instant for the API. Null when empty or invalid.
export function isoFromLocalDateTime(value: string): IsoDateTime | null {
	if (value === '') {
		return null;
	}
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

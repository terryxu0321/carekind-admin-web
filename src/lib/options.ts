// Builds select / radio options from shared enum lists and their UI labels.
import type { Facility } from '@carekind/shared';
import type { SelectOption } from '../components/SelectField';

export function enumOptions<Value extends string>(
	values: readonly Value[],
	labels: Record<Value, string>,
): SelectOption[] {
	return values.map((value) => ({ value, label: labels[value] }));
}

export function facilityOptions(facilities: readonly Facility[]): SelectOption[] {
	return facilities.map((facility) => ({
		value: facility.id,
		label: `${facility.name} (${facility.state})`,
	}));
}

export function facilityName(facilities: readonly Facility[], facilityId: string | null): string {
	if (facilityId === null) {
		return '—';
	}
	return facilities.find((facility) => facility.id === facilityId)?.name ?? 'Another facility';
}

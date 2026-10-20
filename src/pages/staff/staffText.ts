import type { Facility, StaffAssignment } from '@carekind/shared';
import { ROLE_LABELS } from '../../lib/labels';
import { facilityName } from '../../lib/options';

export function assignmentsText(
	assignments: readonly StaffAssignment[],
	facilities: readonly Facility[],
): string {
	if (assignments.length === 0) {
		return 'No facility';
	}
	return assignments
		.map((item) => `${facilityName(facilities, item.facilityId)} — ${ROLE_LABELS[item.role]}`)
		.join('; ');
}

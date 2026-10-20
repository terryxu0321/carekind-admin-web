// Display-only permission helpers built on the shared rules; the API still enforces (P-6).
import { type Action, type OrgMe, type Staff, can, canInFacility } from '@carekind/shared';

// True when the signed-in person may do this somewhere (decides which nav items to show).
export function canAnywhere(me: OrgMe, action: Action): boolean {
	if (me.isOrgAdmin) {
		return can('org_admin', action);
	}
	return me.assignments.some((assignment) => canInFacility(me, assignment.facilityId, action));
}

// A staff record can be changed by someone holding manage_staff at one of that person's facilities.
export function canManageStaffMember(me: OrgMe, staff: Pick<Staff, 'assignments'>): boolean {
	if (me.isOrgAdmin) {
		return can('org_admin', 'manage_staff');
	}
	return staff.assignments.some((assignment) =>
		canInFacility(me, assignment.facilityId, 'manage_staff'),
	);
}

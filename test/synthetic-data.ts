// 合成数据，仅用于开发与测试 — synthetic data for tests only (code-rules P-3). Every name is
// obviously fictional; no real people, residents or facilities.
import {
	type AuditEntry,
	type Consent,
	type Credential,
	type Facility,
	type FacilityOverview,
	type FacilityRole,
	GOLIVE_ITEM_KEYS,
	type GoLiveItem,
	type GoLiveStatus,
	NURSE_APP_NOT_LIVE,
	type OrgMe,
	type ResidentDetail,
	type ResidentStatus,
	type Staff,
	type WorkflowSettings,
	addDays,
} from '@carekind/shared';
import { todayIso } from '../src/lib/dates';

export const ORG_ID = '00000000-0000-4000-8000-000000000001';
export const FACILITY_NSW_ID = '00000000-0000-4000-8000-0000000000a1';
export const FACILITY_VIC_ID = '00000000-0000-4000-8000-0000000000a2';
export const ME_ID = '00000000-0000-4000-8000-0000000000b1';
export const STAFF_ID = '00000000-0000-4000-8000-0000000000b2';
export const RESIDENT_ID = '00000000-0000-4000-8000-0000000000c1';
export const CREDENTIAL_ID = '00000000-0000-4000-8000-0000000000d1';

const CREATED_AT = '2026-09-01T00:00:00.000Z';
const timestamps = { createdAt: CREATED_AT, updatedAt: CREATED_AT };

export function makeFacility(
	id: string,
	name: string,
	state: Facility['state'],
	status: Facility['status'] = 'configuring',
): Facility {
	return {
		id,
		organisationId: ORG_ID,
		name,
		address: '1 Example Street, Testville',
		state,
		beds: 60,
		timezone: state === 'VIC' ? 'Australia/Melbourne' : 'Australia/Sydney',
		status,
		...timestamps,
	};
}

export const FACILITY_NSW = makeFacility(FACILITY_NSW_ID, 'Synthetic Harbour House', 'NSW');
export const FACILITY_VIC = makeFacility(FACILITY_VIC_ID, 'Synthetic Bayside Lodge', 'VIC');
export const FACILITIES = [FACILITY_NSW, FACILITY_VIC];

function makeMe(isOrgAdmin: boolean, role: FacilityRole | null): OrgMe {
	return {
		audience: 'org',
		staffId: ME_ID,
		organisationId: ORG_ID,
		organisationName: 'Synthetic Care Group',
		givenName: 'Testa',
		familyName: 'Admin',
		email: 'testa.admin@example.com',
		isOrgAdmin,
		assignments: role === null ? [] : [{ facilityId: FACILITY_NSW_ID, role }],
	};
}

export const ME_ORG_ADMIN = makeMe(true, null);
export const ME_FACILITY_MANAGER = makeMe(false, 'facility_manager');
export const ME_DON = makeMe(false, 'don');
export const ME_ADMIN_OFFICER = makeMe(false, 'admin_officer');

export const STAFF_MEMBER: Staff = {
	id: STAFF_ID,
	organisationId: ORG_ID,
	givenName: 'Fictiona',
	familyName: 'Nurseworth',
	position: 'Registered Nurse',
	employmentType: 'part_time',
	isOrgAdmin: false,
	hasAppAccess: true,
	email: 'fictiona.nurseworth@example.com',
	lifecycle: 'recorded',
	trainingCompletedAt: null,
	assignments: [{ facilityId: FACILITY_NSW_ID, role: 'rn' }],
	...timestamps,
};

export const CREDENTIAL: Credential = {
	id: CREDENTIAL_ID,
	staffId: STAFF_ID,
	kind: 'ahpra_registration',
	reference: 'NMW0000000000',
	expiresAt: addDays(todayIso(), 20),
	reminder: 'due_30',
	...timestamps,
};

export function makeResident(status: ResidentStatus, facilityId = FACILITY_NSW_ID): ResidentDetail {
	return {
		id: RESIDENT_ID,
		organisationId: ORG_ID,
		facilityId,
		givenName: 'Imagina',
		preferredName: null,
		familyName: 'Testperson',
		room: '12B',
		status,
		events: [],
		...timestamps,
	};
}

export const UNKNOWN_CONSENT: Consent = {
	residentId: RESIDENT_ID,
	status: 'unknown',
	source: null,
	jurisdiction: null,
	basisNote: null,
	recordedBy: null,
	recordedAt: null,
};

export const WORKFLOW_SETTINGS: WorkflowSettings = {
	facilityId: FACILITY_NSW_ID,
	pcwRequiresRnReview: true,
	reviewRecordTypes: ['progress_note'],
	unreviewedReminderMinutes: 60,
	escalateTo: 'on_duty_rn',
	incidentNotifyRoles: ['don'],
	transferToFacilitySystemDays: 1,
	transferOwnerStaffId: null,
};

export function makeGoLive(items: GoLiveItem[], facility: Facility = FACILITY_NSW): GoLiveStatus {
	return {
		facilityId: facility.id,
		state: facility.state,
		status: facility.status,
		items,
		canActivate: false,
		blockers: [],
	};
}

// Every checklist item, completed except those listed; staff notice given `noticeDaysAgo` days ago.
export function goLiveItems(incomplete: readonly string[], noticeDaysAgo: number): GoLiveItem[] {
	return GOLIVE_ITEM_KEYS.map((key) => ({
		key,
		completedAt: incomplete.includes(key) ? null : CREATED_AT,
		completedBy: incomplete.includes(key) ? null : ME_ID,
		noticeSentOn: key === 'staff_notice_sent' ? addDays(todayIso(), -noticeDaysAgo) : null,
	}));
}

export const OVERVIEW_ROWS: FacilityOverview[] = [
	{
		facilityId: FACILITY_NSW_ID,
		facilityName: FACILITY_NSW.name,
		state: 'NSW',
		status: 'live',
		residentsInResidence: 40,
		residentsConsented: 30,
		consentCoverage: 0.75,
		currentStaffCount: 20,
		appEnabledStaffCount: 16,
		credentialsDueWithin60Days: 2,
		recordTimeliness: NURSE_APP_NOT_LIVE,
		pendingReviewCount: NURSE_APP_NOT_LIVE,
		pendingAttributionRatio: NURSE_APP_NOT_LIVE,
	},
	{
		facilityId: FACILITY_VIC_ID,
		facilityName: FACILITY_VIC.name,
		state: 'VIC',
		status: 'configuring',
		residentsInResidence: 0,
		residentsConsented: 0,
		consentCoverage: null,
		currentStaffCount: 0,
		appEnabledStaffCount: 0,
		credentialsDueWithin60Days: 0,
		recordTimeliness: NURSE_APP_NOT_LIVE,
		pendingReviewCount: NURSE_APP_NOT_LIVE,
		pendingAttributionRatio: NURSE_APP_NOT_LIVE,
	},
];

export const AUDIT_ENTRIES: AuditEntry[] = [
	{
		id: '00000000-0000-4000-8000-0000000000e1',
		organisationId: ORG_ID,
		actorType: 'staff',
		actorId: ME_ID,
		action: 'facility.update',
		entity: 'facility',
		entityId: FACILITY_NSW_ID,
		occurredAt: CREATED_AT,
		summary: 'Facility profile updated',
	},
];

// Fake API responses for an organisation admin browsing the synthetic organisation.
export function baseRoutes(): Record<string, unknown> {
	return {
		'GET /org/overview': OVERVIEW_ROWS,
		'GET /org/facilities': FACILITIES,
		[`GET /org/facilities/${FACILITY_NSW_ID}`]: FACILITY_NSW,
		[`GET /org/facilities/${FACILITY_NSW_ID}/go-live`]: makeGoLive(
			goLiveItems(['contract_signed'], 5),
		),
		[`GET /org/facilities/${FACILITY_NSW_ID}/workflow-settings`]: WORKFLOW_SETTINGS,
		'GET /org/staff': [STAFF_MEMBER],
		[`GET /org/staff/${STAFF_ID}`]: STAFF_MEMBER,
		[`GET /org/staff/${STAFF_ID}/credentials`]: [CREDENTIAL],
		[`GET /org/facilities/${FACILITY_NSW_ID}/residents`]: [makeResident('in_residence')],
		[`GET /org/residents/${RESIDENT_ID}`]: makeResident('in_residence'),
		[`GET /org/residents/${RESIDENT_ID}/consent`]: UNKNOWN_CONSENT,
		'GET /org/audit': AUDIT_ENTRIES,
	};
}

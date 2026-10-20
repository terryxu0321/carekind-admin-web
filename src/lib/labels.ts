// English UI labels for every shared enum value (the value lists themselves live in @carekind/shared).
import type {
	ConsentSource,
	ConsentStatus,
	CredentialKind,
	CredentialReminder,
	EmploymentType,
	EscalationTarget,
	FacilityRole,
	FacilityStatus,
	GoLiveItemKey,
	RecordType,
	ResidentEventType,
	ResidentStatus,
	StaffLifecycle,
} from '@carekind/shared';

export const FACILITY_STATUS_LABELS: Record<FacilityStatus, string> = {
	configuring: 'Configuring',
	live: 'Live',
	suspended: 'Suspended',
};

export const ROLE_LABELS: Record<FacilityRole, string> = {
	facility_manager: 'Facility manager',
	don: 'Director of Nursing',
	admin_officer: 'Admin / quality officer',
	rn: 'Registered Nurse',
	en: 'Enrolled Nurse',
	pcw: 'Personal Care Worker',
	no_app: 'Other staff (no app)',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
	full_time: 'Full time',
	part_time: 'Part time',
	casual: 'Casual',
	agency: 'Agency',
};

export const STAFF_LIFECYCLE_LABELS: Record<StaffLifecycle, string> = {
	recorded: 'Recorded',
	invited: 'Invited',
	pending_training: 'Pending training',
	active: 'Active',
	deactivated: 'Deactivated',
};

export const CREDENTIAL_KIND_LABELS: Record<CredentialKind, string> = {
	ahpra_registration: 'Ahpra registration',
	worker_screening: 'Worker screening',
	police_check: 'Police check',
	carekind_training: 'CareKind training',
};

// Reminder text only — a reminder never decides whether someone may work (SPEC-011 PA-02a).
export const CREDENTIAL_REMINDER_LABELS: Record<CredentialReminder, string> = {
	none: 'No reminder',
	due_60: 'Expires within 60 days',
	due_30: 'Expires within 30 days',
	expired: 'Expired',
};

export const RESIDENT_STATUS_LABELS: Record<ResidentStatus, string> = {
	pre_admission: 'Pre-admission',
	in_residence: 'In residence',
	temporary_leave: 'Temporary leave',
	transferring: 'Transferring',
	departed: 'Departed',
	deceased: 'Deceased',
	archived: 'Archived',
};

export const RESIDENT_EVENT_LABELS: Record<ResidentEventType, string> = {
	admit: 'Admit',
	temporary_leave: 'Start temporary leave',
	return: 'Return from leave',
	transfer_out: 'Transfer to another facility',
	transfer_accept: 'Accept transfer',
	depart: 'Record permanent departure',
	death: 'Record death',
	archive: 'Archive record',
};

export const CONSENT_STATUS_LABELS: Record<ConsentStatus, string> = {
	consented: 'Consented',
	not_consented: 'Not consented',
	withdrawn: 'Withdrawn',
	unknown: 'Unknown (treated as not consented)',
};

export const CONSENT_SOURCE_LABELS: Record<ConsentSource, string> = {
	self: 'Resident',
	supporter: 'Resident with a registered supporter',
	substitute_decision_maker: 'Substitute decision-maker',
};

export const GO_LIVE_ITEM_LABELS: Record<GoLiveItemKey, string> = {
	contract_signed: 'Contract signed',
	staff_register_imported: 'Staff register imported',
	resident_register_imported: 'Resident register imported',
	consent_recorded: 'Resident consent recorded',
	staff_notice_sent: 'Written notice given to staff',
	training_completed: 'Staff training completed',
	record_transfer_agreed: 'Record transfer agreed',
};

export const ESCALATION_LABELS: Record<EscalationTarget, string> = {
	on_duty_rn: 'On-duty RN',
	don: 'Director of Nursing',
};

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
	progress_note: 'Progress notes',
	adl: 'ADL charting',
};

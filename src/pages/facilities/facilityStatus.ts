// Facility status is a system state, so it may use status-tag tones (DESIGN.md §7.3).
import type { FacilityStatus } from '@carekind/shared';
import type { StatusTone } from '../../components/StatusTag';

const FACILITY_STATUS_TONE: Record<FacilityStatus, StatusTone> = {
	configuring: 'offline',
	live: 'confirmed',
	suspended: 'error',
};

export function facilityStatusTone(status: FacilityStatus): StatusTone {
	return FACILITY_STATUS_TONE[status];
}

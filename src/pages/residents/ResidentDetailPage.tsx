// SPEC-011 PA-03 resident detail: profile form (the page's one form), lifecycle events and
// consent, each changed through its own dialog. The status decides whether the AI may attribute
// speech to this resident, so it is shown next to the lifecycle actions.
import {
	type Facility,
	type ResidentDetail,
	type ResidentEventResult,
	allowedResidentEvents,
	canInFacility,
	isAttributionCandidate,
} from '@carekind/shared';
import { type ReactElement, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { Button, ButtonLink } from '../../components/Button';
import { type Column, DataTable } from '../../components/DataTable';
import { Notice } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { formatDateTime, formatPersonName } from '../../lib/format';
import { RESIDENT_EVENT_LABELS, RESIDENT_STATUS_LABELS } from '../../lib/labels';
import { facilityName } from '../../lib/options';
import { useFacilities } from '../../lib/useFacilities';
import { useLoad } from '../../lib/useLoad';
import { ConsentSection } from './ConsentSection';
import { ResidentEventDialog } from './ResidentEventDialog';
import { ResidentProfileSection } from './ResidentProfileSection';

export function ResidentDetailPage(): ReactElement {
	const { residentId = '' } = useParams();
	const api = useApi();
	const loader = useCallback(() => api.org.getResident(residentId), [api, residentId]);
	const resident = useLoad(loader);
	const facilities = useFacilities();
	const facilityList = facilities.state.status === 'ready' ? facilities.state.data : [];

	return (
		<LoadView result={resident} loadingLabel="Loading resident…">
			{(data) => (
				<ResidentDetailView
					resident={data}
					facilities={facilityList}
					onChanged={resident.reload}
				/>
			)}
		</LoadView>
	);
}

interface ResidentDetailViewProps {
	resident: ResidentDetail;
	facilities: Facility[];
	onChanged: () => void;
}

type EventRow = ResidentDetail['events'][number];

function ResidentDetailView({
	resident,
	facilities,
	onChanged,
}: ResidentDetailViewProps): ReactElement {
	const me = useMe();
	const [isRecordingEvent, setIsRecordingEvent] = useState(false);
	const [consentVersion, setConsentVersion] = useState(0);
	const [lastResult, setLastResult] = useState<ResidentEventResult | null>(null);
	const facility = facilities.find((item) => item.id === resident.facilityId);
	const canManage = canInFacility(me, resident.facilityId, 'manage_residents');
	const events = allowedResidentEvents(resident.status);

	const handleRecorded = (result: ResidentEventResult): void => {
		setIsRecordingEvent(false);
		setLastResult(result);
		if (result.consentReset) {
			setConsentVersion((version) => version + 1);
		}
		onChanged();
	};

	const eventColumns: Column<EventRow>[] = [
		{ header: 'Event', render: (row) => RESIDENT_EVENT_LABELS[row.type] },
		{ header: 'When', render: (row) => formatDateTime(row.occurredAt) },
		{ header: 'From', render: (row) => facilityName(facilities, row.fromFacilityId) },
		{ header: 'To', render: (row) => facilityName(facilities, row.toFacilityId) },
	];

	return (
		<>
			<PageHeader
				title={formatPersonName(resident)}
				description={`${facility?.name ?? 'Facility'} · Room ${resident.room ?? 'not set'}`}
				actions={
					<ButtonLink to={`/residents?facilityId=${resident.facilityId}`}>
						Back to residents
					</ButtonLink>
				}
			/>
			{lastResult?.consentReset ? (
				<ConsentResetNotice result={lastResult} facilities={facilities} />
			) : null}
			<section className="ck-section" aria-labelledby="status-heading">
				<div className="ck-section-header">
					<h2 id="status-heading" className="ck-section-title">
						Status: {RESIDENT_STATUS_LABELS[resident.status]}
					</h2>
					{canManage && events.length > 0 ? (
						<Button onClick={() => setIsRecordingEvent(true)}>
							Record lifecycle event
						</Button>
					) : null}
				</div>
				<p className="ck-help">
					{isAttributionCandidate(resident.status)
						? 'Included in AI attribution: staff can dictate notes about this resident.'
						: 'Not included in AI attribution: only residents in residence can be matched.'}
				</p>
				{resident.events.length > 0 ? (
					<DataTable
						caption="Lifecycle history"
						columns={eventColumns}
						rows={resident.events}
						rowKey={(row) => row.id}
					/>
				) : (
					<p>No lifecycle events recorded yet.</p>
				)}
			</section>
			<ConsentSection
				key={consentVersion}
				residentId={resident.id}
				canManage={canInFacility(me, resident.facilityId, 'manage_consent')}
				defaultJurisdiction={facility?.state ?? null}
			/>
			<ResidentProfileSection
				key={resident.updatedAt}
				resident={resident}
				canEdit={canManage && resident.status !== 'archived'}
				onSaved={onChanged}
			/>
			{isRecordingEvent ? (
				<ResidentEventDialog
					resident={resident}
					facilities={facilities}
					onClose={() => setIsRecordingEvent(false)}
					onRecorded={handleRecorded}
				/>
			) : null}
		</>
	);
}

interface ConsentResetNoticeProps {
	result: ResidentEventResult;
	facilities: Facility[];
}

// SPEC-011 §3.1: after a transfer is accepted consent is Unknown again; across states the
// new state's consent rules apply (SPEC-009), so staff are asked to re-confirm.
function ConsentResetNotice({ result, facilities }: ConsentResetNoticeProps): ReactElement {
	const state = facilities.find((item) => item.id === result.resident.facilityId)?.state;
	if (result.crossStateTransfer) {
		return (
			<Notice title="Re-confirm consent under the new state's rules">
				This resident moved to a facility in {state ?? 'another state'}. Consent was reset
				to Unknown and is treated as not consented. Record the consent decision again under{' '}
				{state ?? 'that state'}&apos;s rules.
			</Notice>
		);
	}
	return (
		<Notice title="Re-confirm consent">
			Consent was reset to Unknown after the transfer and is treated as not consented. Record
			the consent decision again.
		</Notice>
	);
}

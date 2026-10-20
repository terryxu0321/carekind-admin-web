// Facility detail: profile, go-live checklist and workflow settings as tabs, so only one
// tab (and so at most one form) is on screen at a time (DESIGN.md §7.3).
import { type Facility, canInFacility } from '@carekind/shared';
import { type ReactElement, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { ButtonLink } from '../../components/Button';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { StatusTag } from '../../components/StatusTag';
import { type TabItem, Tabs } from '../../components/Tabs';
import { canAnywhere } from '../../lib/access';
import { FACILITY_STATUS_LABELS } from '../../lib/labels';
import { useLoad } from '../../lib/useLoad';
import { FacilityProfileTab } from './FacilityProfileTab';
import { GoLiveTab } from './GoLiveTab';
import { WorkflowSettingsTab } from './WorkflowSettingsTab';
import { facilityStatusTone } from './facilityStatus';

type FacilityTab = 'profile' | 'go-live' | 'workflow';

export function FacilityDetailPage(): ReactElement {
	const { facilityId = '' } = useParams();
	const api = useApi();
	const loader = useCallback(() => api.org.getFacility(facilityId), [api, facilityId]);
	const facility = useLoad(loader);

	return (
		<LoadView result={facility} loadingLabel="Loading facility…">
			{(data) => <FacilityDetail facility={data} onChanged={facility.replace} />}
		</LoadView>
	);
}

interface FacilityDetailProps {
	facility: Facility;
	onChanged: (facility: Facility) => void;
}

function FacilityDetail({ facility, onChanged }: FacilityDetailProps): ReactElement {
	const me = useMe();
	const [tab, setTab] = useState<FacilityTab>('profile');
	const canConfigureWorkflow = canInFacility(me, facility.id, 'configure_workflow');
	const tabs: TabItem<FacilityTab>[] = [
		{ key: 'profile', label: 'Profile' },
		{ key: 'go-live', label: 'Go-live checklist' },
	];
	if (canConfigureWorkflow) {
		tabs.push({ key: 'workflow', label: 'Workflow settings' });
	}

	return (
		<>
			<PageHeader
				title={facility.name}
				description={`${facility.state} · ${facility.beds} beds`}
				actions={
					<>
						<StatusTag
							tone={facilityStatusTone(facility.status)}
							label={FACILITY_STATUS_LABELS[facility.status]}
						/>
						{canAnywhere(me, 'manage_residents') ? (
							<ButtonLink
								variant="utility"
								to={`/residents?facilityId=${facility.id}`}
							>
								Residents
							</ButtonLink>
						) : null}
						{canAnywhere(me, 'manage_staff') ? (
							<ButtonLink variant="utility" to={`/staff?facilityId=${facility.id}`}>
								Staff
							</ButtonLink>
						) : null}
					</>
				}
			/>
			<Tabs label="Facility sections" tabs={tabs} selected={tab} onSelect={setTab} />
			<section className="ck-section" role="tabpanel" aria-label={tab}>
				{tab === 'profile' ? (
					<FacilityProfileTab facility={facility} onSaved={onChanged} />
				) : null}
				{tab === 'go-live' ? (
					<GoLiveTab facility={facility} onActivated={onChanged} />
				) : null}
				{tab === 'workflow' && canConfigureWorkflow ? (
					<WorkflowSettingsTab facilityId={facility.id} />
				) : null}
			</section>
		</>
	);
}

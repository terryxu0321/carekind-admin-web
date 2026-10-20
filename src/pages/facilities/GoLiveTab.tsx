// SPEC-011 PA-05 go-live checklist. Each item is completed in its own dialog (one form each);
// "Enable recording" stays disabled, with the reasons listed, until the shared
// canActivateFacility rule finds no blockers (incl. NSW 14-day staff notice). The API re-checks.
import {
	type Facility,
	type GoLiveItem,
	type GoLiveStatus,
	NSW_STAFF_NOTICE_DAYS,
	canActivateFacility,
	canInFacility,
} from '@carekind/shared';
import { type ReactElement, useCallback, useState } from 'react';
import { useApi, useMe } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { type Column, DataTable } from '../../components/DataTable';
import { Notice } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { todayIso } from '../../lib/dates';
import { formatDate, formatDateTime } from '../../lib/format';
import { GO_LIVE_ITEM_LABELS } from '../../lib/labels';
import { useLoad } from '../../lib/useLoad';
import { ActivateFacilityDialog } from './ActivateFacilityDialog';
import { GoLiveItemDialog } from './GoLiveItemDialog';
import { blockerKey, blockerText } from './goLiveText';

interface GoLiveTabProps {
	facility: Facility;
	onActivated: (facility: Facility) => void;
}

export function GoLiveTab({ facility, onActivated }: GoLiveTabProps): ReactElement {
	const api = useApi();
	const loader = useCallback(() => api.org.getGoLive(facility.id), [api, facility.id]);
	const goLive = useLoad(loader);

	return (
		<LoadView result={goLive} loadingLabel="Loading go-live checklist…">
			{(status) => (
				<GoLiveChecklist
					facility={facility}
					status={status}
					onStatusChanged={goLive.replace}
					onActivated={onActivated}
				/>
			)}
		</LoadView>
	);
}

interface GoLiveChecklistProps {
	facility: Facility;
	status: GoLiveStatus;
	onStatusChanged: (status: GoLiveStatus) => void;
	onActivated: (facility: Facility) => void;
}

function GoLiveChecklist({
	facility,
	status,
	onStatusChanged,
	onActivated,
}: GoLiveChecklistProps): ReactElement {
	const me = useMe();
	const canManage = canInFacility(me, facility.id, 'manage_go_live');
	const [editingItem, setEditingItem] = useState<GoLiveItem | null>(null);
	const [isActivating, setIsActivating] = useState(false);
	const decision = canActivateFacility(status.items, facility.state, todayIso());

	const columns: Column<GoLiveItem>[] = [
		{ header: 'Item', render: (item) => GO_LIVE_ITEM_LABELS[item.key] },
		{
			header: 'Status',
			render: (item) =>
				item.completedAt === null
					? 'Not done'
					: `✓ Done ${formatDateTime(item.completedAt)}`,
		},
		{
			header: 'Notice given on',
			render: (item) =>
				item.key === 'staff_notice_sent' ? formatDate(item.noticeSentOn) : '',
		},
	];
	if (canManage) {
		columns.push({
			header: 'Action',
			render: (item) => (
				<Button variant="utility" onClick={() => setEditingItem(item)}>
					Update {GO_LIVE_ITEM_LABELS[item.key].toLowerCase()}
				</Button>
			),
		});
	}

	return (
		<>
			{facility.state === 'NSW' ? (
				<Notice title="NSW staff notice">
					Staff must get written notice at least {NSW_STAFF_NOTICE_DAYS} days before
					recording starts at this facility.
				</Notice>
			) : null}
			<DataTable
				caption="Go-live checklist"
				columns={columns}
				rows={status.items}
				rowKey={(item) => item.key}
			/>
			<section className="ck-section" aria-labelledby="activation-heading">
				<h2 id="activation-heading" className="ck-section-title">
					Enable recording
				</h2>
				{facility.status === 'live' ? (
					<p>✓ This facility is live. Recording is enabled.</p>
				) : (
					<ActivationPanel
						blockers={decision.blockers.map((blocker) => ({
							key: blockerKey(blocker),
							text: blockerText(blocker),
						}))}
						canManage={canManage}
						onActivate={() => setIsActivating(true)}
					/>
				)}
			</section>
			{editingItem ? (
				<GoLiveItemDialog
					facility={facility}
					item={editingItem}
					onClose={() => setEditingItem(null)}
					onSaved={(next) => {
						onStatusChanged(next);
						setEditingItem(null);
					}}
				/>
			) : null}
			{isActivating ? (
				<ActivateFacilityDialog
					facility={facility}
					onClose={() => setIsActivating(false)}
					onActivated={(next) => {
						setIsActivating(false);
						onActivated(next);
					}}
				/>
			) : null}
		</>
	);
}

interface ActivationPanelProps {
	blockers: { key: string; text: string }[];
	canManage: boolean;
	onActivate: () => void;
}

function ActivationPanel({ blockers, canManage, onActivate }: ActivationPanelProps): ReactElement {
	return (
		<>
			{blockers.length > 0 ? (
				<>
					<p id="activation-blockers-intro">Recording cannot start yet:</p>
					<ul className="ck-list" aria-labelledby="activation-blockers-intro">
						{blockers.map((blocker) => (
							<li key={blocker.key}>{blocker.text}</li>
						))}
					</ul>
				</>
			) : (
				<p>✓ Every checklist item is complete.</p>
			)}
			{canManage ? (
				<Button variant="primary" disabled={blockers.length > 0} onClick={onActivate}>
					Enable recording
				</Button>
			) : (
				<p className="ck-help">
					Only an organisation admin or facility manager can enable recording.
				</p>
			)}
		</>
	);
}

// SPEC-011 PA-06 / PA-06a: company overview, one row per facility. Facility-level aggregates
// only — never per-person figures or rankings (PRD S-07), never clinical risk indicators (TGA).
import { type FacilityOverview, type UnavailableMetric, consentCoverage } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApi, useMe } from '../auth/AuthContext';
import { ButtonLink } from '../components/Button';
import { type Column, DataTable } from '../components/DataTable';
import { EmptyState } from '../components/Feedback';
import { LoadView } from '../components/LoadView';
import { PageHeader } from '../components/PageHeader';
import { StatusTag } from '../components/StatusTag';
import { canAnywhere } from '../lib/access';
import { formatPercent, rateOrNull } from '../lib/format';
import { FACILITY_STATUS_LABELS } from '../lib/labels';
import { useLoad } from '../lib/useLoad';
import { facilityStatusTone } from './facilities/facilityStatus';

// CORE-09: metrics that need the nurse app are labelled as unavailable, never invented.
const UNAVAILABLE_TEXT: Record<UnavailableMetric['reason'], string> = {
	nurse_app_not_live: 'Not yet available — nurse app not live',
};

function unavailable(metric: UnavailableMetric): string {
	return UNAVAILABLE_TEXT[metric.reason];
}

const COLUMNS: readonly Column<FacilityOverview>[] = [
	{
		header: 'Facility',
		render: (row) => <Link to={`/facilities/${row.facilityId}`}>{row.facilityName}</Link>,
	},
	{ header: 'State', render: (row) => row.state },
	{
		header: 'Go-live status',
		render: (row) => (
			<StatusTag
				tone={facilityStatusTone(row.status)}
				label={FACILITY_STATUS_LABELS[row.status]}
			/>
		),
	},
	{
		header: 'Residents in residence',
		isNumeric: true,
		render: (row) => row.residentsInResidence,
	},
	{
		header: 'Consent coverage',
		isNumeric: true,
		render: (row) =>
			formatPercent(
				consentCoverage(row.residentsConsented, row.residentsInResidence),
				'No residents',
			),
	},
	{ header: 'Current staff', isNumeric: true, render: (row) => row.currentStaffCount },
	{
		header: 'App enabled',
		isNumeric: true,
		render: (row) =>
			formatPercent(rateOrNull(row.appEnabledStaffCount, row.currentStaffCount), 'No staff'),
	},
	{
		header: 'Credentials due within 60 days',
		isNumeric: true,
		render: (row) => row.credentialsDueWithin60Days,
	},
	{ header: 'Record timeliness', render: (row) => unavailable(row.recordTimeliness) },
	{ header: 'Pending review', render: (row) => unavailable(row.pendingReviewCount) },
	{ header: 'Pending attribution', render: (row) => unavailable(row.pendingAttributionRatio) },
];

export function OverviewPage(): ReactElement {
	const api = useApi();
	const me = useMe();
	const loader = useCallback(() => api.org.getOverview(), [api]);
	const overview = useLoad(loader);

	return (
		<>
			<PageHeader
				title="Overview"
				description="Totals for each facility you manage. CareKind never shows figures for individual staff."
			/>
			<LoadView result={overview} loadingLabel="Loading overview…">
				{(rows) =>
					rows.length === 0 ? (
						<EmptyState
							title="No facilities yet"
							body="Add your first facility to start the go-live checklist."
							action={
								canAnywhere(me, 'create_facility') ? (
									<ButtonLink to="/facilities/new">Add facility</ButtonLink>
								) : undefined
							}
						/>
					) : (
						<DataTable
							caption="Facility overview"
							columns={COLUMNS}
							rows={rows}
							rowKey={(row) => row.facilityId}
						/>
					)
				}
			</LoadView>
		</>
	);
}

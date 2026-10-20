// SPEC-011 PA-03 resident register, one facility at a time. The facility selector applies at
// once (no submit button on list pages).
import { type Facility, type Resident, canInFacility } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { ButtonLink } from '../../components/Button';
import { type Column, DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { formatPersonName } from '../../lib/format';
import { RESIDENT_STATUS_LABELS } from '../../lib/labels';
import { facilityOptions } from '../../lib/options';
import { useFacilities } from '../../lib/useFacilities';
import { useLoad } from '../../lib/useLoad';
import { useFacilityParam } from './useFacilityParam';

const COLUMNS: readonly Column<Resident>[] = [
	{
		header: 'Name',
		render: (row) => <Link to={`/residents/${row.id}`}>{formatPersonName(row)}</Link>,
	},
	{ header: 'Room', render: (row) => row.room ?? '—' },
	{ header: 'Status', render: (row) => RESIDENT_STATUS_LABELS[row.status] },
];

export function ResidentsListPage(): ReactElement {
	const facilities = useFacilities();
	return (
		<>
			<PageHeader title="Residents" />
			<LoadView result={facilities} loadingLabel="Loading facilities…">
				{(all) =>
					all.length === 0 ? (
						<EmptyState
							title="No facilities yet"
							body="Residents are added to a facility. Add a facility first."
						/>
					) : (
						<ResidentRegister facilities={all} />
					)
				}
			</LoadView>
		</>
	);
}

function ResidentRegister({ facilities }: { facilities: Facility[] }): ReactElement {
	const me = useMe();
	const api = useApi();
	const [selectedId, setSelectedId] = useFacilityParam();
	const facilityId = selectedId || (facilities[0]?.id ?? '');
	const loader = useCallback(() => api.org.listResidents(facilityId), [api, facilityId]);
	const residents = useLoad(loader);
	const canManage = canInFacility(me, facilityId, 'manage_residents');
	const query = `?facilityId=${facilityId}`;

	return (
		<>
			<div className="ck-filters">
				<SelectField
					label="Facility"
					value={facilityId}
					onChange={setSelectedId}
					options={facilityOptions(facilities)}
				/>
				{canManage ? (
					<div className="ck-toolbar">
						<ButtonLink to={`/residents/new${query}`}>Add resident</ButtonLink>
						<ButtonLink variant="utility" to={`/residents/import${query}`}>
							Import residents CSV
						</ButtonLink>
					</div>
				) : null}
			</div>
			<LoadView result={residents} loadingLabel="Loading residents…">
				{(rows) =>
					rows.length === 0 ? (
						<EmptyState
							title="No residents at this facility yet"
							body="Import the resident register from a CSV file, or add residents one at a time."
							action={
								canManage ? (
									<ButtonLink to={`/residents/import${query}`}>
										Import residents CSV
									</ButtonLink>
								) : undefined
							}
						/>
					) : (
						<DataTable
							caption="Resident register"
							columns={COLUMNS}
							rows={rows}
							rowKey={(row) => row.id}
						/>
					)
				}
			</LoadView>
		</>
	);
}

import type { Facility } from '@carekind/shared';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useMe } from '../../auth/AuthContext';
import { ButtonLink } from '../../components/Button';
import { type Column, DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { StatusTag } from '../../components/StatusTag';
import { canAnywhere } from '../../lib/access';
import { FACILITY_STATUS_LABELS } from '../../lib/labels';
import { useFacilities } from '../../lib/useFacilities';
import { facilityStatusTone } from './facilityStatus';

const COLUMNS: readonly Column<Facility>[] = [
	{ header: 'Facility', render: (row) => <Link to={`/facilities/${row.id}`}>{row.name}</Link> },
	{ header: 'State', render: (row) => row.state },
	{ header: 'Beds', isNumeric: true, render: (row) => row.beds },
	{
		header: 'Status',
		render: (row) => (
			<StatusTag
				tone={facilityStatusTone(row.status)}
				label={FACILITY_STATUS_LABELS[row.status]}
			/>
		),
	},
];

export function FacilitiesListPage(): ReactElement {
	const me = useMe();
	const facilities = useFacilities();
	const canCreate = canAnywhere(me, 'create_facility');
	const addButton = canCreate ? <ButtonLink to="/facilities/new">Add facility</ButtonLink> : null;

	return (
		<>
			<PageHeader title="Facilities" actions={addButton} />
			<LoadView result={facilities} loadingLabel="Loading facilities…">
				{(rows) =>
					rows.length === 0 ? (
						<EmptyState
							title="No facilities yet"
							body={
								canCreate
									? 'Add your first facility to start the go-live checklist.'
									: 'Ask your organisation admin to add a facility and assign you to it.'
							}
							action={addButton ?? undefined}
						/>
					) : (
						<DataTable
							caption="Facilities"
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

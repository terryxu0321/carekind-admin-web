// SPEC-011 PA-02: the full staff register, including staff who never use the app. The facility
// filter applies as soon as it changes (no submit button on list pages).
import type { Facility, Staff } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { ButtonLink } from '../../components/Button';
import { type Column, DataTable } from '../../components/DataTable';
import { EmptyState, ErrorBanner } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { canAnywhere } from '../../lib/access';
import { formatPersonName } from '../../lib/format';
import { EMPLOYMENT_TYPE_LABELS, STAFF_LIFECYCLE_LABELS } from '../../lib/labels';
import { facilityOptions } from '../../lib/options';
import { useFacilities } from '../../lib/useFacilities';
import { useLoad } from '../../lib/useLoad';
import { assignmentsText } from './staffText';

function staffColumns(facilities: readonly Facility[]): Column<Staff>[] {
	return [
		{
			header: 'Name',
			render: (row) => <Link to={`/staff/${row.id}`}>{formatPersonName(row)}</Link>,
		},
		{ header: 'Position', render: (row) => row.position },
		{ header: 'Employment', render: (row) => EMPLOYMENT_TYPE_LABELS[row.employmentType] },
		{
			header: 'Facilities and roles',
			render: (row) => assignmentsText(row.assignments, facilities),
		},
		{ header: 'App access', render: (row) => (row.hasAppAccess ? 'Yes' : 'No') },
		{ header: 'Status', render: (row) => STAFF_LIFECYCLE_LABELS[row.lifecycle] },
	];
}

export function StaffListPage(): ReactElement {
	const me = useMe();
	if (!canAnywhere(me, 'manage_staff')) {
		return (
			<>
				<PageHeader title="Staff" />
				<ErrorBanner message="Your role does not include the staff register." />
			</>
		);
	}
	return <StaffRegister />;
}

function StaffRegister(): ReactElement {
	const api = useApi();
	const [searchParams, setSearchParams] = useSearchParams();
	const facilityId = searchParams.get('facilityId') ?? '';
	const facilities = useFacilities();
	const loader = useCallback(
		() => api.org.listStaff(facilityId === '' ? {} : { facilityId }),
		[api, facilityId],
	);
	const staff = useLoad(loader);

	const facilityList = facilities.state.status === 'ready' ? facilities.state.data : [];
	return (
		<>
			<PageHeader
				title="Staff"
				actions={
					<>
						<ButtonLink to="/staff/new">Add staff member</ButtonLink>
						<ButtonLink variant="utility" to="/staff/import">
							Import staff CSV
						</ButtonLink>
					</>
				}
			/>
			<div className="ck-filters">
				<SelectField
					label="Facility"
					value={facilityId}
					onChange={(next) => setSearchParams(next === '' ? {} : { facilityId: next })}
					options={facilityOptions(facilityList)}
					placeholder="All facilities"
					isRequired={false}
				/>
			</div>
			<LoadView result={staff} loadingLabel="Loading staff…">
				{(rows) =>
					rows.length === 0 ? (
						<EmptyState
							title="No staff yet"
							body="Import your staff register from a CSV file, or add people one at a time."
							action={<ButtonLink to="/staff/import">Import staff CSV</ButtonLink>}
						/>
					) : (
						<DataTable
							caption="Staff register"
							columns={staffColumns(facilityList)}
							rows={rows}
							rowKey={(row) => row.id}
						/>
					)
				}
			</LoadView>
		</>
	);
}

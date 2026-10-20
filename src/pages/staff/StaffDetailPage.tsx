// SPEC-011 PA-02 / PA-02b staff detail: profile form (the page's one form), facilities and
// roles, credentials, and lifecycle actions — each action opens its own dialog.
import { type Facility, type Staff, staffUpdateRequestSchema } from '@carekind/shared';
import { type FormEvent, type ReactElement, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { Button, ButtonLink } from '../../components/Button';
import { type Column, DataTable } from '../../components/DataTable';
import { ErrorBanner } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { useToast } from '../../components/Toast';
import { canManageStaffMember } from '../../lib/access';
import { formatDateTime, formatPersonName } from '../../lib/format';
import { EMPLOYMENT_TYPE_LABELS, ROLE_LABELS, STAFF_LIFECYCLE_LABELS } from '../../lib/labels';
import { facilityName } from '../../lib/options';
import { useFacilities } from '../../lib/useFacilities';
import { useLoad } from '../../lib/useLoad';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';
import { useSubmit } from '../../lib/useSubmit';
import { CredentialsSection } from './CredentialsSection';
import { StaffActions } from './StaffActions';
import { StaffFields, staffBodyFrom, staffValuesFrom } from './StaffFields';

export function StaffDetailPage(): ReactElement {
	const { staffId = '' } = useParams();
	const api = useApi();
	const loader = useCallback(() => api.org.getStaff(staffId), [api, staffId]);
	const staff = useLoad(loader);
	const facilities = useFacilities();
	const facilityList = facilities.state.status === 'ready' ? facilities.state.data : [];

	return (
		<LoadView result={staff} loadingLabel="Loading staff member…">
			{(data) => (
				<StaffDetail staff={data} facilities={facilityList} onChanged={staff.replace} />
			)}
		</LoadView>
	);
}

interface StaffDetailProps {
	staff: Staff;
	facilities: Facility[];
	onChanged: (staff: Staff) => void;
}

function StaffDetail({ staff, facilities, onChanged }: StaffDetailProps): ReactElement {
	const me = useMe();
	const canManage = canManageStaffMember(me, staff) && staff.lifecycle !== 'deactivated';
	const assignmentColumns: Column<Staff['assignments'][number]>[] = [
		{ header: 'Facility', render: (row) => facilityName(facilities, row.facilityId) },
		{ header: 'Role', render: (row) => ROLE_LABELS[row.role] },
	];

	return (
		<>
			<PageHeader
				title={formatPersonName(staff)}
				description={`${staff.position} · ${STAFF_LIFECYCLE_LABELS[staff.lifecycle]}`}
				actions={<ButtonLink to="/staff">Back to staff</ButtonLink>}
			/>
			{canManage ? (
				<StaffActions staff={staff} facilities={facilities} onChanged={onChanged} />
			) : null}
			<section className="ck-section" aria-labelledby="profile-heading">
				<h2 id="profile-heading" className="ck-section-title">
					Profile
				</h2>
				{canManage ? (
					<StaffProfileForm key={staff.updatedAt} staff={staff} onSaved={onChanged} />
				) : (
					<StaffProfileDetails staff={staff} />
				)}
			</section>
			<section className="ck-section" aria-labelledby="assignments-heading">
				<h2 id="assignments-heading" className="ck-section-title">
					Facilities and roles
				</h2>
				<DataTable
					caption="Facilities and roles"
					columns={assignmentColumns}
					rows={staff.assignments}
					rowKey={(row) => row.facilityId}
				/>
			</section>
			<CredentialsSection staffId={staff.id} canManage={canManage} />
		</>
	);
}

function StaffProfileDetails({ staff }: { staff: Staff }): ReactElement {
	return (
		<dl className="ck-details">
			<dt>Position</dt>
			<dd>{staff.position}</dd>
			<dt>Employment type</dt>
			<dd>{EMPLOYMENT_TYPE_LABELS[staff.employmentType]}</dd>
			<dt>Uses the CareKind app</dt>
			<dd>{staff.hasAppAccess ? 'Yes' : 'No'}</dd>
			<dt>Email</dt>
			<dd>{staff.email ?? '—'}</dd>
			<dt>CareKind training completed</dt>
			<dd>{formatDateTime(staff.trainingCompletedAt)}</dd>
		</dl>
	);
}

interface StaffProfileFormProps {
	staff: Staff;
	onSaved: (staff: Staff) => void;
}

function StaffProfileForm({ staff, onSaved }: StaffProfileFormProps): ReactElement {
	const me = useMe();
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const [values, setValues] = useState(() => staffValuesFrom(staff));
	const [errors, setErrors] = useState<FieldErrors>({});

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const body = staffBodyFrom(values);
		// Only organisation admins may change organisation-admin access.
		const parsed = staffUpdateRequestSchema.safeParse(
			me.isOrgAdmin ? body : { ...body, isOrgAdmin: undefined },
		);
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			onSaved(await api.org.updateStaff(staff.id, parsed.data));
			showToast('Staff member saved');
		});
	};

	return (
		<form
			className="ck-form ck-form--page"
			onSubmit={handleSubmit}
			noValidate
			aria-label="Staff profile"
		>
			{submit.error ? <ErrorBanner message={submit.error} /> : null}
			<StaffFields
				values={values}
				onChange={setValues}
				errors={errors}
				canSetOrgAdmin={me.isOrgAdmin}
			/>
			<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
				Save staff member
			</Button>
		</form>
	);
}

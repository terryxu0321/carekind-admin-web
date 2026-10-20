// PA-02 single entry: add one staff member with their first facility and role. More
// facilities are added later from the staff detail page.
import {
	FACILITY_ROLES,
	type Facility,
	canInFacility,
	staffCreateRequestSchema,
} from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { Button, ButtonLink } from '../../components/Button';
import { ErrorBanner } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { useToast } from '../../components/Toast';
import { ROLE_LABELS } from '../../lib/labels';
import { enumOptions, facilityOptions } from '../../lib/options';
import { useFacilities } from '../../lib/useFacilities';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';
import { useSubmit } from '../../lib/useSubmit';
import { EMPTY_STAFF_VALUES, StaffFields, staffBodyFrom } from './StaffFields';

export function NewStaffPage(): ReactElement {
	const facilities = useFacilities();
	return (
		<>
			<PageHeader
				title="Add staff member"
				actions={<ButtonLink to="/staff">Back to staff</ButtonLink>}
			/>
			<LoadView result={facilities} loadingLabel="Loading facilities…">
				{(all) => <NewStaffForm facilities={all} />}
			</LoadView>
		</>
	);
}

function NewStaffForm({ facilities }: { facilities: Facility[] }): ReactElement {
	const me = useMe();
	const api = useApi();
	const navigate = useNavigate();
	const showToast = useToast();
	const submit = useSubmit();
	const [values, setValues] = useState(EMPTY_STAFF_VALUES);
	const [facilityId, setFacilityId] = useState('');
	const [role, setRole] = useState('');
	const [errors, setErrors] = useState<FieldErrors>({});
	const manageable = facilities.filter((facility) =>
		canInFacility(me, facility.id, 'manage_staff'),
	);

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const assignmentErrors: FieldErrors = {};
		if (facilityId === '') {
			assignmentErrors.facilityId = 'Choose the facility this person works at.';
		}
		if (role === '') {
			assignmentErrors.role = 'Choose their role at that facility.';
		}
		const parsed = staffCreateRequestSchema.safeParse({
			...staffBodyFrom(values),
			isOrgAdmin: me.isOrgAdmin ? values.isOrgAdmin : false,
			assignments: facilityId === '' || role === '' ? [] : [{ facilityId, role }],
		});
		const nextErrors = {
			...(parsed.success ? {} : fieldErrorsFrom(parsed.error.issues)),
			...assignmentErrors,
		};
		setErrors(nextErrors);
		if (!parsed.success || Object.keys(assignmentErrors).length > 0) {
			return;
		}
		void submit.run(async () => {
			const staff = await api.org.createStaff(parsed.data);
			showToast('Staff member added');
			navigate(`/staff/${staff.id}`);
		});
	};

	return (
		<form className="ck-form ck-form--page" onSubmit={handleSubmit} noValidate>
			{submit.error ? <ErrorBanner message={submit.error} /> : null}
			<StaffFields
				values={values}
				onChange={setValues}
				errors={errors}
				canSetOrgAdmin={me.isOrgAdmin}
			/>
			<SelectField
				label="Facility"
				value={facilityId}
				onChange={setFacilityId}
				options={facilityOptions(manageable)}
				placeholder="Choose a facility"
				error={errors.facilityId}
			/>
			<SelectField
				label="Role at this facility"
				value={role}
				onChange={setRole}
				options={enumOptions(FACILITY_ROLES, ROLE_LABELS)}
				placeholder="Choose a role"
				error={errors.role}
			/>
			<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
				Add staff member
			</Button>
		</form>
	);
}

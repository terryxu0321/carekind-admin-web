// Staff profile fields shared by "Add staff member" and the staff detail profile form.
import { EMPLOYMENT_TYPES, type Staff } from '@carekind/shared';
import type { ReactElement } from 'react';
import { CheckboxField } from '../../components/ChoiceFields';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { EMPLOYMENT_TYPE_LABELS } from '../../lib/labels';
import { enumOptions } from '../../lib/options';
import type { FieldErrors } from '../../lib/validation';

export interface StaffFormValues {
	givenName: string;
	familyName: string;
	position: string;
	employmentType: string;
	hasAppAccess: boolean;
	email: string;
	isOrgAdmin: boolean;
}

export const EMPTY_STAFF_VALUES: StaffFormValues = {
	givenName: '',
	familyName: '',
	position: '',
	employmentType: '',
	hasAppAccess: false,
	email: '',
	isOrgAdmin: false,
};

export function staffValuesFrom(staff: Staff): StaffFormValues {
	return {
		givenName: staff.givenName,
		familyName: staff.familyName,
		position: staff.position,
		employmentType: staff.employmentType,
		hasAppAccess: staff.hasAppAccess,
		email: staff.email ?? '',
		isOrgAdmin: staff.isOrgAdmin,
	};
}

// Form strings → request body fields; the shared schema decides what is valid.
export function staffBodyFrom(values: StaffFormValues): Record<string, unknown> {
	return {
		...values,
		employmentType: values.employmentType === '' ? undefined : values.employmentType,
		email: values.email.trim() === '' ? null : values.email.trim(),
	};
}

interface StaffFieldsProps {
	values: StaffFormValues;
	onChange: (values: StaffFormValues) => void;
	errors: FieldErrors;
	// Only organisation admins may grant organisation-admin access.
	canSetOrgAdmin: boolean;
}

export function StaffFields({
	values,
	onChange,
	errors,
	canSetOrgAdmin,
}: StaffFieldsProps): ReactElement {
	const update = <Key extends keyof StaffFormValues>(
		key: Key,
		value: StaffFormValues[Key],
	): void => onChange({ ...values, [key]: value });
	return (
		<>
			<TextField
				label="Given name"
				value={values.givenName}
				onChange={(v) => update('givenName', v)}
				error={errors.givenName}
			/>
			<TextField
				label="Family name"
				value={values.familyName}
				onChange={(v) => update('familyName', v)}
				error={errors.familyName}
			/>
			<TextField
				label="Position"
				value={values.position}
				onChange={(v) => update('position', v)}
				error={errors.position}
			/>
			<SelectField
				label="Employment type"
				value={values.employmentType}
				onChange={(v) => update('employmentType', v)}
				options={enumOptions(EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_LABELS)}
				placeholder="Choose employment type"
				error={errors.employmentType}
			/>
			<CheckboxField
				label="Uses the CareKind app"
				help="Staff without the app stay on the register for completeness."
				checked={values.hasAppAccess}
				onChange={(checked) => update('hasAppAccess', checked)}
			/>
			<TextField
				label="Email"
				type="email"
				isRequired={values.hasAppAccess}
				help="Needed for app access. CareKind never emails staff; you share invite links yourself."
				value={values.email}
				onChange={(v) => update('email', v)}
				error={errors.email}
			/>
			{canSetOrgAdmin ? (
				<CheckboxField
					label="Organisation admin (can manage every facility)"
					checked={values.isOrgAdmin}
					onChange={(checked) => update('isOrgAdmin', checked)}
				/>
			) : null}
		</>
	);
}

// Facility profile fields shared by "New facility" and the profile tab (one form on each page).
import { AUSTRALIAN_STATES, type AustralianState, type Facility } from '@carekind/shared';
import type { ReactElement } from 'react';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import type { FieldErrors } from '../../lib/validation';

export interface FacilityFormValues {
	name: string;
	address: string;
	state: string;
	beds: string;
	timezone: string;
}

export const EMPTY_FACILITY_VALUES: FacilityFormValues = {
	name: '',
	address: '',
	state: '',
	beds: '',
	timezone: '',
};

// Facilities are Australian sites only (PA-01); the API accepts any Australia/* zone.
const STATE_TIMEZONES: Record<AustralianState, string> = {
	NSW: 'Australia/Sydney',
	VIC: 'Australia/Melbourne',
	QLD: 'Australia/Brisbane',
	WA: 'Australia/Perth',
	SA: 'Australia/Adelaide',
	TAS: 'Australia/Hobart',
	ACT: 'Australia/Sydney',
	NT: 'Australia/Darwin',
};

const TIMEZONE_OPTIONS = [...new Set([...Object.values(STATE_TIMEZONES), 'Australia/Broken_Hill'])]
	.sort()
	.map((zone) => ({ value: zone, label: zone.replace('Australia/', '').replace('_', ' ') }));

const STATE_OPTIONS = AUSTRALIAN_STATES.map((state) => ({ value: state, label: state }));

export function facilityValuesFrom(facility: Facility): FacilityFormValues {
	return {
		name: facility.name,
		address: facility.address,
		state: facility.state,
		beds: String(facility.beds),
		timezone: facility.timezone,
	};
}

// Form strings → request body; the shared schema then decides what is valid.
export function facilityBodyFrom(values: FacilityFormValues): Record<string, unknown> {
	return {
		name: values.name,
		address: values.address,
		state: values.state === '' ? undefined : values.state,
		beds: values.beds.trim() === '' ? undefined : Number(values.beds),
		timezone: values.timezone === '' ? undefined : values.timezone,
	};
}

interface FacilityFieldsProps {
	values: FacilityFormValues;
	onChange: (values: FacilityFormValues) => void;
	errors: FieldErrors;
}

export function FacilityFields({ values, onChange, errors }: FacilityFieldsProps): ReactElement {
	const update = (field: keyof FacilityFormValues, value: string): void =>
		onChange({ ...values, [field]: value });
	const changeState = (state: string): void => {
		// Suggest the state's time zone only when none was chosen yet.
		const suggested = STATE_TIMEZONES[state as AustralianState] ?? '';
		onChange({ ...values, state, timezone: values.timezone || suggested });
	};
	return (
		<>
			<TextField
				label="Facility name"
				value={values.name}
				onChange={(v) => update('name', v)}
				error={errors.name}
			/>
			<TextField
				label="Address"
				value={values.address}
				onChange={(v) => update('address', v)}
				error={errors.address}
			/>
			<SelectField
				label="State or territory"
				help="Recording, health privacy and staff notice rules follow the facility's state."
				value={values.state}
				onChange={changeState}
				options={STATE_OPTIONS}
				placeholder="Choose a state"
				error={errors.state}
			/>
			<TextField
				label="Number of beds"
				inputMode="numeric"
				value={values.beds}
				onChange={(v) => update('beds', v)}
				error={errors.beds}
			/>
			<SelectField
				label="Time zone"
				value={values.timezone}
				onChange={(v) => update('timezone', v)}
				options={TIMEZONE_OPTIONS}
				placeholder="Choose a time zone"
				error={errors.timezone}
			/>
		</>
	);
}

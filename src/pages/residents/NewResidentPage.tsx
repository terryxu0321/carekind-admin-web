// PA-03 / PA-03a: a new resident starts before admission (or already in residence when loading
// an existing register). Consent starts as Unknown and is treated as not consented.
import {
	type Facility,
	INITIAL_RESIDENT_STATUSES,
	canInFacility,
	residentCreateRequestSchema,
} from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { Button, ButtonLink } from '../../components/Button';
import { RadioGroup } from '../../components/ChoiceFields';
import { ErrorBanner } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { RESIDENT_STATUS_LABELS } from '../../lib/labels';
import { enumOptions, facilityOptions } from '../../lib/options';
import { useFacilities } from '../../lib/useFacilities';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';
import { useSubmit } from '../../lib/useSubmit';
import { useFacilityParam } from './useFacilityParam';

export function NewResidentPage(): ReactElement {
	const facilities = useFacilities();
	const [facilityId] = useFacilityParam();
	return (
		<>
			<PageHeader
				title="Add resident"
				description="Consent starts as Unknown and is treated as not consented until you record a decision."
				actions={
					<ButtonLink to={`/residents?facilityId=${facilityId}`}>
						Back to residents
					</ButtonLink>
				}
			/>
			<LoadView result={facilities} loadingLabel="Loading facilities…">
				{(all) => <NewResidentForm facilities={all} initialFacilityId={facilityId} />}
			</LoadView>
		</>
	);
}

interface NewResidentFormProps {
	facilities: Facility[];
	initialFacilityId: string;
}

function blankToNull(value: string): string | null {
	return value.trim() === '' ? null : value;
}

function NewResidentForm({ facilities, initialFacilityId }: NewResidentFormProps): ReactElement {
	const me = useMe();
	const api = useApi();
	const navigate = useNavigate();
	const showToast = useToast();
	const submit = useSubmit();
	const [facilityId, setFacilityId] = useState(initialFacilityId);
	const [givenName, setGivenName] = useState('');
	const [preferredName, setPreferredName] = useState('');
	const [familyName, setFamilyName] = useState('');
	const [room, setRoom] = useState('');
	// Not pre-selected: the status decides whether the resident enters the AI attribution roster.
	const [status, setStatus] = useState<string | null>(null);
	const [errors, setErrors] = useState<FieldErrors>({});
	const manageable = facilities.filter((facility) =>
		canInFacility(me, facility.id, 'manage_residents'),
	);

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const parsed = residentCreateRequestSchema.safeParse({
			givenName,
			preferredName: blankToNull(preferredName),
			familyName,
			room: blankToNull(room),
			status: status ?? undefined,
		});
		const nextErrors: FieldErrors = parsed.success ? {} : fieldErrorsFrom(parsed.error.issues);
		if (facilityId === '') {
			nextErrors.facilityId = 'Choose the facility this resident lives at.';
		}
		if (status === null) {
			nextErrors.status = 'Choose whether the resident has moved in yet.';
		}
		setErrors(nextErrors);
		if (!parsed.success || Object.keys(nextErrors).length > 0) {
			return;
		}
		void submit.run(async () => {
			const resident = await api.org.createResident(facilityId, parsed.data);
			showToast('Resident added');
			navigate(`/residents/${resident.id}`);
		});
	};

	return (
		<form className="ck-form ck-form--page" onSubmit={handleSubmit} noValidate>
			{submit.error ? <ErrorBanner message={submit.error} /> : null}
			<SelectField
				label="Facility"
				value={facilityId}
				onChange={setFacilityId}
				options={facilityOptions(manageable)}
				placeholder="Choose a facility"
				error={errors.facilityId}
			/>
			<TextField
				label="Given name"
				value={givenName}
				onChange={setGivenName}
				error={errors.givenName}
			/>
			<TextField
				label="Preferred name"
				isRequired={false}
				value={preferredName}
				onChange={setPreferredName}
				error={errors.preferredName}
			/>
			<TextField
				label="Family name"
				value={familyName}
				onChange={setFamilyName}
				error={errors.familyName}
			/>
			<TextField
				label="Room"
				isRequired={false}
				help="A second identifier helps staff tell apart residents with the same name."
				value={room}
				onChange={setRoom}
				error={errors.room}
			/>
			<RadioGroup
				legend="Status"
				options={enumOptions(INITIAL_RESIDENT_STATUSES, RESIDENT_STATUS_LABELS)}
				value={status}
				onChange={setStatus}
				error={errors.status}
			/>
			<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
				Add resident
			</Button>
		</form>
	);
}

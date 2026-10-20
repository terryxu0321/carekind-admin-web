// Resident profile: names and room. Status changes only through lifecycle events; archived
// records are read-only (SPEC-011 §3.1).
import { type Resident, residentUpdateRequestSchema } from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/Feedback';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { useSubmit } from '../../lib/useSubmit';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';

interface ResidentProfileSectionProps {
	resident: Resident;
	canEdit: boolean;
	onSaved: () => void;
}

function blankToNull(value: string): string | null {
	return value.trim() === '' ? null : value;
}

export function ResidentProfileSection({
	resident,
	canEdit,
	onSaved,
}: ResidentProfileSectionProps): ReactElement {
	return (
		<section className="ck-section" aria-labelledby="resident-profile-heading">
			<h2 id="resident-profile-heading" className="ck-section-title">
				Profile
			</h2>
			{canEdit ? (
				<ResidentProfileForm resident={resident} onSaved={onSaved} />
			) : (
				<dl className="ck-details">
					<dt>Given name</dt>
					<dd>{resident.givenName}</dd>
					<dt>Preferred name</dt>
					<dd>{resident.preferredName ?? '—'}</dd>
					<dt>Family name</dt>
					<dd>{resident.familyName}</dd>
					<dt>Room</dt>
					<dd>{resident.room ?? '—'}</dd>
				</dl>
			)}
		</section>
	);
}

function ResidentProfileForm({
	resident,
	onSaved,
}: {
	resident: Resident;
	onSaved: () => void;
}): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const [givenName, setGivenName] = useState(resident.givenName);
	const [preferredName, setPreferredName] = useState(resident.preferredName ?? '');
	const [familyName, setFamilyName] = useState(resident.familyName);
	const [room, setRoom] = useState(resident.room ?? '');
	const [errors, setErrors] = useState<FieldErrors>({});

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const parsed = residentUpdateRequestSchema.safeParse({
			givenName,
			preferredName: blankToNull(preferredName),
			familyName,
			room: blankToNull(room),
		});
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			await api.org.updateResident(resident.id, parsed.data);
			showToast('Resident saved');
			onSaved();
		});
	};

	return (
		<form
			className="ck-form ck-form--page"
			onSubmit={handleSubmit}
			noValidate
			aria-label="Resident profile"
		>
			{submit.error ? <ErrorBanner message={submit.error} /> : null}
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
				value={room}
				onChange={setRoom}
				error={errors.room}
			/>
			<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
				Save resident
			</Button>
		</form>
	);
}

import {
	CREDENTIAL_KINDS,
	type Credential,
	credentialCreateRequestSchema,
	credentialUpdateRequestSchema,
} from '@carekind/shared';
import { type ReactElement, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { DateTimeField } from '../../components/DateTimeField';
import { FormDialog } from '../../components/FormDialog';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { CREDENTIAL_KIND_LABELS } from '../../lib/labels';
import { enumOptions } from '../../lib/options';
import { useSubmit } from '../../lib/useSubmit';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';

interface CredentialDialogProps {
	staffId: string;
	// Null adds a new credential; otherwise the credential being edited (its kind is fixed).
	credential: Credential | null;
	onClose: () => void;
	onSaved: () => void;
}

function blankToNull(value: string): string | null {
	return value.trim() === '' ? null : value.trim();
}

export function CredentialDialog({
	staffId,
	credential,
	onClose,
	onSaved,
}: CredentialDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const [kind, setKind] = useState<string>(credential?.kind ?? '');
	const [reference, setReference] = useState(credential?.reference ?? '');
	const [expiresAt, setExpiresAt] = useState(credential?.expiresAt ?? '');
	const [errors, setErrors] = useState<FieldErrors>({});

	const save = (): void => {
		const fields = { reference: blankToNull(reference), expiresAt: blankToNull(expiresAt) };
		if (credential === null) {
			const parsed = credentialCreateRequestSchema.safeParse({
				kind: kind || undefined,
				...fields,
			});
			if (!parsed.success) {
				setErrors(fieldErrorsFrom(parsed.error.issues));
				return;
			}
			setErrors({});
			void submit.run(async () => {
				await api.org.createCredential(staffId, parsed.data);
				showToast('Credential added');
				onSaved();
			});
			return;
		}
		const parsed = credentialUpdateRequestSchema.safeParse(fields);
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			await api.org.updateCredential(staffId, credential.id, parsed.data);
			showToast('Credential saved');
			onSaved();
		});
	};

	return (
		<FormDialog
			title={
				credential === null
					? 'Add credential'
					: `Edit ${CREDENTIAL_KIND_LABELS[credential.kind]}`
			}
			submitLabel="Save credential"
			onSubmit={save}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			{credential === null ? (
				<SelectField
					label="Credential"
					value={kind}
					onChange={setKind}
					options={enumOptions(CREDENTIAL_KINDS, CREDENTIAL_KIND_LABELS)}
					placeholder="Choose a credential"
					error={errors.kind}
				/>
			) : null}
			<TextField
				label="Reference number"
				isRequired={false}
				help="For example the Ahpra registration number."
				value={reference}
				onChange={setReference}
				error={errors.reference}
			/>
			<DateTimeField
				label="Expiry date (optional)"
				kind="date"
				value={expiresAt}
				onChange={setExpiresAt}
				error={errors.expiresAt}
			/>
		</FormDialog>
	);
}

interface RemoveCredentialDialogProps {
	staffId: string;
	credential: Credential;
	onClose: () => void;
	onRemoved: () => void;
}

export function RemoveCredentialDialog({
	staffId,
	credential,
	onClose,
	onRemoved,
}: RemoveCredentialDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const label = CREDENTIAL_KIND_LABELS[credential.kind];
	const remove = (): void => {
		void submit.run(async () => {
			await api.org.deleteCredential(staffId, credential.id);
			showToast('Credential removed');
			onRemoved();
		});
	};
	return (
		<FormDialog
			title={`Remove ${label}?`}
			submitLabel="Remove credential"
			cancelLabel="Keep credential"
			onSubmit={remove}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			<p>
				No more expiry reminders will appear for this {label.toLowerCase()}. The change is
				kept in the audit log.
			</p>
		</FormDialog>
	);
}

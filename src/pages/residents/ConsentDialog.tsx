// SPEC-009 M-02 / M-02a: record a consent decision with its source and jurisdiction.
// The status options come from the shared request schema, which excludes "unknown": unknown
// only means no decision is recorded (or it was reset by a transfer).
import {
	AUSTRALIAN_STATES,
	type AustralianState,
	CONSENT_SOURCES,
	type Consent,
	consentUpdateRequestSchema,
} from '@carekind/shared';
import { type ReactElement, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { RadioGroup } from '../../components/ChoiceFields';
import { FormDialog } from '../../components/FormDialog';
import { SelectField } from '../../components/SelectField';
import { TextAreaField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { CONSENT_SOURCE_LABELS, CONSENT_STATUS_LABELS } from '../../lib/labels';
import { enumOptions } from '../../lib/options';
import { useSubmit } from '../../lib/useSubmit';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';

const RECORDABLE_STATUSES = consentUpdateRequestSchema.shape.status.options;
const BASIS_NOTE_MAX_LENGTH = 500;

interface ConsentDialogProps {
	residentId: string;
	current: Consent | null;
	defaultJurisdiction: AustralianState | null;
	onClose: () => void;
	onSaved: (consent: Consent) => void;
}

export function ConsentDialog({
	residentId,
	current,
	defaultJurisdiction,
	onClose,
	onSaved,
}: ConsentDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	// Never pre-selected: the person recording must choose the decision and who made it.
	const [status, setStatus] = useState<string | null>(null);
	const [source, setSource] = useState<string | null>(null);
	const [jurisdiction, setJurisdiction] = useState<string>(
		current?.jurisdiction ?? defaultJurisdiction ?? '',
	);
	const [basisNote, setBasisNote] = useState(current?.basisNote ?? '');
	const [errors, setErrors] = useState<FieldErrors>({});

	const save = (): void => {
		const parsed = consentUpdateRequestSchema.safeParse({
			status: status ?? undefined,
			source: source ?? undefined,
			jurisdiction: jurisdiction === '' ? undefined : jurisdiction,
			basisNote: basisNote.trim() === '' ? null : basisNote,
		});
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			onSaved(await api.org.updateConsent(residentId, parsed.data));
			showToast('Consent decision saved');
		});
	};

	return (
		<FormDialog
			title="Record consent decision"
			submitLabel="Save consent decision"
			onSubmit={save}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			<p>
				Your facility obtains and keeps the consent document. A change takes effect at once;
				after a withdrawal, unsigned AI drafts about this resident are deleted.
			</p>
			<RadioGroup
				legend="Decision"
				options={enumOptions(RECORDABLE_STATUSES, CONSENT_STATUS_LABELS)}
				value={status}
				onChange={setStatus}
				error={errors.status}
			/>
			<RadioGroup
				legend="Decision made by"
				options={enumOptions(CONSENT_SOURCES, CONSENT_SOURCE_LABELS)}
				value={source}
				onChange={setSource}
				error={errors.source}
			/>
			<SelectField
				label="State rules applied"
				value={jurisdiction}
				onChange={setJurisdiction}
				options={AUSTRALIAN_STATES.map((state) => ({ value: state, label: state }))}
				placeholder="Choose a state"
				error={errors.jurisdiction}
			/>
			<TextAreaField
				label="Basis and document reference"
				help="For example the substitute decision-maker's legal basis and your consent form number. Do not enter health information."
				value={basisNote}
				onChange={setBasisNote}
				maxLength={BASIS_NOTE_MAX_LENGTH}
				error={errors.basisNote}
			/>
		</FormDialog>
	);
}

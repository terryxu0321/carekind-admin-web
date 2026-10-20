// SPEC-011 §3.1 lifecycle events. Only the events the shared state machine allows from the
// current status are offered; the API rejects anything else. Leaving residence takes the
// resident out of AI attribution at once (hazard: notes attributed to the wrong person).
import {
	type Facility,
	type ResidentDetail,
	type ResidentEventResult,
	type ResidentEventType,
	allowedResidentEvents,
	residentEventCreateRequestSchema,
} from '@carekind/shared';
import { type ReactElement, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { RadioGroup } from '../../components/ChoiceFields';
import { DateTimeField } from '../../components/DateTimeField';
import { FormDialog } from '../../components/FormDialog';
import { SelectField } from '../../components/SelectField';
import { useToast } from '../../components/Toast';
import { isoFromLocalDateTime } from '../../lib/dates';
import { RESIDENT_EVENT_LABELS } from '../../lib/labels';
import { enumOptions, facilityOptions } from '../../lib/options';
import { useSubmit } from '../../lib/useSubmit';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';

interface ResidentEventDialogProps {
	resident: ResidentDetail;
	facilities: Facility[];
	onClose: () => void;
	onRecorded: (result: ResidentEventResult) => void;
}

export function ResidentEventDialog({
	resident,
	facilities,
	onClose,
	onRecorded,
}: ResidentEventDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const [type, setType] = useState<ResidentEventType | null>(null);
	const [occurredAt, setOccurredAt] = useState('');
	const [toFacilityId, setToFacilityId] = useState('');
	const [errors, setErrors] = useState<FieldErrors>({});
	const allowed = allowedResidentEvents(resident.status);
	const currentState = facilities.find((item) => item.id === resident.facilityId)?.state;
	const destinations = facilities.filter((item) => item.id !== resident.facilityId);
	const destinationState = destinations.find((item) => item.id === toFacilityId)?.state;

	const save = (): void => {
		const parsed = residentEventCreateRequestSchema.safeParse({
			type: type ?? undefined,
			occurredAt: isoFromLocalDateTime(occurredAt) ?? undefined,
			toFacilityId: type === 'transfer_out' && toFacilityId !== '' ? toFacilityId : undefined,
		});
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			onRecorded(await api.org.recordResidentEvent(resident.id, parsed.data));
			showToast('Lifecycle event recorded');
		});
	};

	return (
		<FormDialog
			title="Record lifecycle event"
			submitLabel="Record event"
			onSubmit={save}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			<p>
				Only residents in residence can have notes attributed to them. Leave, transfer,
				departure and death take effect straight away.
			</p>
			<RadioGroup
				legend="Event"
				options={enumOptions(allowed, RESIDENT_EVENT_LABELS)}
				value={type}
				onChange={(next) => setType(next as ResidentEventType)}
				error={errors.type}
			/>
			<DateTimeField
				label="When it happened"
				kind="datetime-local"
				value={occurredAt}
				onChange={setOccurredAt}
				help="Day/month/year and 24-hour time."
				error={
					errors.occurredAt
						? 'Enter the date and time, for example 07:42 today.'
						: undefined
				}
			/>
			{type === 'transfer_out' ? (
				<SelectField
					label="Receiving facility"
					value={toFacilityId}
					onChange={setToFacilityId}
					options={facilityOptions(destinations)}
					placeholder="Choose a facility"
					help={
						destinationState !== undefined && destinationState !== currentState
							? `This facility is in ${destinationState}. After the transfer is accepted, consent must be recorded again under ${destinationState}'s rules.`
							: 'The receiving facility accepts the transfer.'
					}
					error={
						errors.toFacilityId
							? 'Choose the facility the resident is moving to.'
							: undefined
					}
				/>
			) : null}
		</FormDialog>
	);
}

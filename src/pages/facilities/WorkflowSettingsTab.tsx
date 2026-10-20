// SPEC-011 PA-04: per-facility review and escalation workflow, in one form with one submit.
// Values must stay within the organisation's limits; the API checks them on save
// (the org console has no endpoint to read those limits, so they are not repeated here).
import {
	ESCALATION_TARGETS,
	FACILITY_ROLES,
	RECORD_TYPES,
	type Staff,
	type WorkflowSettings,
	workflowSettingsUpdateRequestSchema,
} from '@carekind/shared';
import { type FormEvent, type ReactElement, useCallback, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { CheckboxField, CheckboxGroup, RadioGroup } from '../../components/ChoiceFields';
import { ErrorBanner } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { formatPersonName } from '../../lib/format';
import { ESCALATION_LABELS, RECORD_TYPE_LABELS, ROLE_LABELS } from '../../lib/labels';
import { enumOptions } from '../../lib/options';
import { type LoadState, useLoad } from '../../lib/useLoad';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';
import { useSubmit } from '../../lib/useSubmit';

const NOTIFY_ROLES = FACILITY_ROLES.filter((role) => role !== 'no_app');

export function WorkflowSettingsTab({ facilityId }: { facilityId: string }): ReactElement {
	const api = useApi();
	const settingsLoader = useCallback(
		() => api.org.getWorkflowSettings(facilityId),
		[api, facilityId],
	);
	const staffLoader = useCallback(() => api.org.listStaff({ facilityId }), [api, facilityId]);
	const settings = useLoad(settingsLoader);
	const staff = useLoad(staffLoader);

	return (
		<LoadView result={settings} loadingLabel="Loading workflow settings…">
			{(data) => (
				<WorkflowSettingsForm
					settings={data}
					staff={staff.state}
					onSaved={settings.replace}
				/>
			)}
		</LoadView>
	);
}

interface WorkflowFormValues {
	pcwRequiresRnReview: boolean;
	reviewRecordTypes: string[];
	unreviewedReminderMinutes: string;
	escalateTo: string;
	incidentNotifyRoles: string[];
	transferToFacilitySystemDays: string;
	transferOwnerStaffId: string;
}

function valuesFrom(settings: WorkflowSettings): WorkflowFormValues {
	return {
		pcwRequiresRnReview: settings.pcwRequiresRnReview,
		reviewRecordTypes: [...settings.reviewRecordTypes],
		unreviewedReminderMinutes: String(settings.unreviewedReminderMinutes),
		escalateTo: settings.escalateTo,
		incidentNotifyRoles: [...settings.incidentNotifyRoles],
		transferToFacilitySystemDays: String(settings.transferToFacilitySystemDays),
		transferOwnerStaffId: settings.transferOwnerStaffId ?? '',
	};
}

function numberOrUndefined(value: string): number | undefined {
	return value.trim() === '' ? undefined : Number(value);
}

function ownerOptions(staff: LoadState<Staff[]>): { value: string; label: string }[] {
	if (staff.status !== 'ready') {
		return [];
	}
	return staff.data
		.filter((member) => member.lifecycle !== 'deactivated')
		.map((member) => ({ value: member.id, label: formatPersonName(member) }));
}

interface WorkflowSettingsFormProps {
	settings: WorkflowSettings;
	staff: LoadState<Staff[]>;
	onSaved: (settings: WorkflowSettings) => void;
}

function WorkflowSettingsForm({
	settings,
	staff,
	onSaved,
}: WorkflowSettingsFormProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const [values, setValues] = useState(() => valuesFrom(settings));
	const [errors, setErrors] = useState<FieldErrors>({});
	const update = <Key extends keyof WorkflowFormValues>(
		key: Key,
		value: WorkflowFormValues[Key],
	): void => setValues((current) => ({ ...current, [key]: value }));

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const parsed = workflowSettingsUpdateRequestSchema.safeParse({
			...values,
			unreviewedReminderMinutes: numberOrUndefined(values.unreviewedReminderMinutes),
			transferToFacilitySystemDays: numberOrUndefined(values.transferToFacilitySystemDays),
			transferOwnerStaffId:
				values.transferOwnerStaffId === '' ? null : values.transferOwnerStaffId,
		});
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			onSaved(await api.org.updateWorkflowSettings(settings.facilityId, parsed.data));
			showToast('Workflow settings saved');
		});
	};

	return (
		<form
			className="ck-form ck-form--page"
			onSubmit={handleSubmit}
			noValidate
			aria-label="Workflow settings"
		>
			{submit.error ? <ErrorBanner message={submit.error} /> : null}
			<p className="ck-help">
				Settings must stay within the limits CareKind set for your organisation. If a value
				is outside them, saving shows which one to change.
			</p>
			<h2 className="ck-section-title">Review</h2>
			<CheckboxField
				label="Records written by personal care workers need RN review"
				checked={values.pcwRequiresRnReview}
				onChange={(checked) => update('pcwRequiresRnReview', checked)}
			/>
			<CheckboxGroup
				legend="Record types that need review"
				options={enumOptions(RECORD_TYPES, RECORD_TYPE_LABELS)}
				values={values.reviewRecordTypes}
				onChange={(next) => update('reviewRecordTypes', next)}
				error={errors.reviewRecordTypes}
			/>
			<TextField
				label="Remind about unreviewed records after (minutes)"
				inputMode="numeric"
				value={values.unreviewedReminderMinutes}
				onChange={(next) => update('unreviewedReminderMinutes', next)}
				error={errors.unreviewedReminderMinutes}
			/>
			<RadioGroup
				legend="Escalate unreviewed records to"
				options={enumOptions(ESCALATION_TARGETS, ESCALATION_LABELS)}
				value={values.escalateTo}
				onChange={(next) => update('escalateTo', next)}
				error={errors.escalateTo}
			/>
			<h2 className="ck-section-title">Incidents and record transfer</h2>
			<CheckboxGroup
				legend="Roles notified of incident drafts"
				options={enumOptions(NOTIFY_ROLES, ROLE_LABELS)}
				values={values.incidentNotifyRoles}
				onChange={(next) => update('incidentNotifyRoles', next)}
				error={errors.incidentNotifyRoles}
			/>
			<TextField
				label="Days to copy signed records into the facility's system"
				inputMode="numeric"
				value={values.transferToFacilitySystemDays}
				onChange={(next) => update('transferToFacilitySystemDays', next)}
				error={errors.transferToFacilitySystemDays}
			/>
			<SelectField
				label="Person responsible for copying records"
				isRequired={false}
				value={values.transferOwnerStaffId}
				onChange={(next) => update('transferOwnerStaffId', next)}
				options={ownerOptions(staff)}
				placeholder="Not assigned"
				isDisabled={staff.status !== 'ready'}
				help={
					staff.status === 'error'
						? 'The staff list is not available for your role, so this stays unchanged.'
						: undefined
				}
				error={errors.transferOwnerStaffId}
			/>
			<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
				Save workflow settings
			</Button>
		</form>
	);
}

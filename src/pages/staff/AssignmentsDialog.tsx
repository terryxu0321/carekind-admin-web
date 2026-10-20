// PA-02 / PA-02b: one person can work at several facilities with a different role at each
// (transfers and extra sites). One facility appears at most once (shared schema).
import {
	FACILITY_ROLES,
	type Facility,
	type Staff,
	staffAssignmentsUpdateRequestSchema,
} from '@carekind/shared';
import { type ReactElement, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { FormDialog } from '../../components/FormDialog';
import { SelectField } from '../../components/SelectField';
import { useToast } from '../../components/Toast';
import { ROLE_LABELS } from '../../lib/labels';
import { enumOptions, facilityOptions } from '../../lib/options';
import { useSubmit } from '../../lib/useSubmit';
import { fieldErrorsFrom } from '../../lib/validation';

interface AssignmentRow {
	facilityId: string;
	role: string;
}

interface AssignmentsDialogProps {
	staff: Staff;
	facilities: Facility[];
	onClose: () => void;
	onSaved: (staff: Staff) => void;
}

export function AssignmentsDialog({
	staff,
	facilities,
	onClose,
	onSaved,
}: AssignmentsDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const [rows, setRows] = useState<AssignmentRow[]>(() =>
		staff.assignments.map((item) => ({ facilityId: item.facilityId, role: item.role })),
	);
	const [error, setError] = useState<string | undefined>(undefined);

	const updateRow = (index: number, change: Partial<AssignmentRow>): void =>
		setRows((current) => current.map((row, i) => (i === index ? { ...row, ...change } : row)));
	const removeRow = (index: number): void =>
		setRows((current) => current.filter((_, i) => i !== index));

	const save = (): void => {
		if (rows.some((row) => row.facilityId === '' || row.role === '')) {
			setError('Choose a facility and a role on every row, or remove the empty row.');
			return;
		}
		const parsed = staffAssignmentsUpdateRequestSchema.safeParse({ assignments: rows });
		if (!parsed.success) {
			setError(
				fieldErrorsFrom(parsed.error.issues).assignments ??
					'Check the facilities and roles.',
			);
			return;
		}
		setError(undefined);
		void submit.run(async () => {
			onSaved(await api.org.updateStaffAssignments(staff.id, parsed.data));
			showToast('Facilities and roles saved');
		});
	};

	return (
		<FormDialog
			title="Facilities and roles"
			submitLabel="Save facilities and roles"
			onSubmit={save}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error ?? error ?? null}
		>
			{rows.length === 0 ? <p>This person is not assigned to any facility.</p> : null}
			{rows.map((row, index) => (
				<fieldset key={index} className="ck-fieldset">
					<legend className="ck-label">Facility {index + 1}</legend>
					<SelectField
						label="Facility"
						value={row.facilityId}
						onChange={(facilityId) => updateRow(index, { facilityId })}
						options={facilityOptions(facilities)}
						placeholder="Choose a facility"
					/>
					<SelectField
						label="Role"
						value={row.role}
						onChange={(role) => updateRow(index, { role })}
						options={enumOptions(FACILITY_ROLES, ROLE_LABELS)}
						placeholder="Choose a role"
					/>
					<Button variant="utility" onClick={() => removeRow(index)}>
						Remove facility {index + 1}
					</Button>
				</fieldset>
			))}
			<Button
				onClick={() => setRows((current) => [...current, { facilityId: '', role: '' }])}
			>
				Add a facility
			</Button>
		</FormDialog>
	);
}

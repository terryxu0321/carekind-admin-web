// One-form CSV import used by the staff and resident import pages: choose a facility, choose a
// file, import. Rejected rows are listed by row number and column only (no row content echoed).
import type { CsvImportResult, Facility } from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { Button } from '../components/Button';
import { type Column, DataTable } from '../components/DataTable';
import { ErrorBanner } from '../components/Feedback';
import { FileUpload } from '../components/FileUpload';
import { SelectField } from '../components/SelectField';
import { useToast } from '../components/Toast';
import { facilityOptions } from '../lib/options';
import type { FieldErrors } from '../lib/validation';
import { useSubmit } from '../lib/useSubmit';

// Registers are small text files; 5 MB is far above any facility's roster and stops mistakes
// such as choosing a spreadsheet export with images.
const MAX_CSV_BYTES = 5 * 1024 * 1024;

type RejectedRow = CsvImportResult['rejectedRows'][number];

const REJECTED_COLUMNS: readonly Column<RejectedRow>[] = [
	{ header: 'Row', isNumeric: true, render: (row) => row.rowNumber },
	{ header: 'Column', render: (row) => row.column ?? 'Whole row' },
	{ header: 'Problem', render: (row) => row.message },
];

interface CsvImportFormProps {
	facilities: readonly Facility[];
	initialFacilityId: string;
	columns: readonly string[];
	// Plural noun for the result, e.g. "staff members".
	noun: string;
	submitLabel: string;
	onImport: (facilityId: string, csv: string) => Promise<CsvImportResult>;
}

function validate(facilityId: string, file: File | null): FieldErrors {
	const errors: FieldErrors = {};
	if (facilityId === '') {
		errors.facilityId = 'Choose the facility these records belong to.';
	}
	if (file === null) {
		errors.file = 'Choose a CSV file to import.';
	} else if (!file.name.toLowerCase().endsWith('.csv')) {
		errors.file = 'This file is not a CSV. Save the register as .csv and choose it again.';
	} else if (file.size > MAX_CSV_BYTES) {
		errors.file = 'This file is larger than 5 MB. Split it into smaller files.';
	}
	return errors;
}

export function CsvImportForm({
	facilities,
	initialFacilityId,
	columns,
	noun,
	submitLabel,
	onImport,
}: CsvImportFormProps): ReactElement {
	const showToast = useToast();
	const submit = useSubmit();
	const [facilityId, setFacilityId] = useState(initialFacilityId);
	const [file, setFile] = useState<File | null>(null);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [result, setResult] = useState<CsvImportResult | null>(null);

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const nextErrors = validate(facilityId, file);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0 || file === null) {
			return;
		}
		void submit.run(async () => {
			const imported = await onImport(facilityId, await file.text());
			setResult(imported);
			showToast(`Imported ${imported.importedCount} ${noun}`);
		});
	};

	return (
		<>
			<form className="ck-form ck-form--page" onSubmit={handleSubmit} noValidate>
				{submit.error ? <ErrorBanner message={submit.error} /> : null}
				<SelectField
					label="Facility"
					value={facilityId}
					onChange={setFacilityId}
					options={facilityOptions(facilities)}
					placeholder="Choose a facility"
					error={errors.facilityId}
				/>
				<FileUpload
					label="Register file (CSV)"
					help={`CSV up to 5 MB with a header row: ${columns.join(', ')}.`}
					accept=".csv,text/csv"
					file={file}
					onChange={setFile}
					isUploading={submit.isSubmitting}
					error={errors.file}
				/>
				<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
					{submitLabel}
				</Button>
			</form>
			{result === null ? null : (
				<section className="ck-section" aria-labelledby="import-result-heading">
					<h2 id="import-result-heading" className="ck-section-title">
						Import result
					</h2>
					<p>
						✓ Imported {result.importedCount} {noun}.
						{result.rejectedRows.length > 0
							? ` ${result.rejectedRows.length} rows were not imported. Fix them in the file and import those rows again.`
							: ''}
					</p>
					{result.rejectedRows.length > 0 ? (
						<DataTable
							caption="Rows not imported"
							columns={REJECTED_COLUMNS}
							rows={result.rejectedRows}
							rowKey={(row) => `${row.rowNumber}-${row.column ?? 'row'}`}
						/>
					) : null}
				</section>
			)}
		</>
	);
}

// DESIGN.md select: native <select> (platform picker), styled like input, label above.
import { type ReactElement, useId } from 'react';
import { FieldMessages, describedBy } from './FieldParts';

export interface SelectOption {
	value: string;
	label: string;
}

interface SelectFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: readonly SelectOption[];
	// Shown as the first, empty option; omit when a value is always selected.
	placeholder?: string;
	help?: string;
	error?: string;
	isDisabled?: boolean;
	isRequired?: boolean;
}

export function SelectField({
	label,
	value,
	onChange,
	options,
	placeholder,
	help,
	error,
	isDisabled = false,
	isRequired = true,
}: SelectFieldProps): ReactElement {
	const id = useId();
	return (
		<div className="ck-field">
			<label htmlFor={id} className="ck-label">
				{label}
				{isRequired ? null : <span className="ck-optional"> (optional)</span>}
			</label>
			<select
				id={id}
				className={error ? 'ck-input ck-select ck-input--error' : 'ck-input ck-select'}
				value={value}
				disabled={isDisabled}
				onChange={(event) => onChange(event.target.value)}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy(id, help, error)}
			>
				{placeholder === undefined ? null : <option value="">{placeholder}</option>}
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<FieldMessages id={id} help={help} error={error} />
		</div>
	);
}

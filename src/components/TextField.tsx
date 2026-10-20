// DESIGN.md input and textarea: visible label above, 48px control, inline error.
import { type HTMLInputTypeAttribute, type ReactElement, useId } from 'react';
import { FieldMessages, describedBy } from './FieldParts';

interface TextFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: HTMLInputTypeAttribute;
	help?: string;
	error?: string;
	autoComplete?: string;
	inputMode?: 'text' | 'numeric' | 'email';
	isRequired?: boolean;
}

export function TextField({
	label,
	value,
	onChange,
	type = 'text',
	help,
	error,
	autoComplete,
	inputMode,
	isRequired = true,
}: TextFieldProps): ReactElement {
	const id = useId();
	return (
		<div className="ck-field">
			<label htmlFor={id} className="ck-label">
				{label}
				{isRequired ? null : <span className="ck-optional"> (optional)</span>}
			</label>
			<input
				id={id}
				type={type}
				className={error ? 'ck-input ck-input--error' : 'ck-input'}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				autoComplete={autoComplete}
				inputMode={inputMode}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy(id, help, error)}
			/>
			<FieldMessages id={id} help={help} error={error} />
		</div>
	);
}

interface TextAreaFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	maxLength: number;
	help?: string;
	error?: string;
}

export function TextAreaField({
	label,
	value,
	onChange,
	maxLength,
	help,
	error,
}: TextAreaFieldProps): ReactElement {
	const id = useId();
	return (
		<div className="ck-field">
			<label htmlFor={id} className="ck-label">
				{label} <span className="ck-optional">(optional)</span>
			</label>
			<textarea
				id={id}
				className={error ? 'ck-input ck-textarea ck-input--error' : 'ck-input ck-textarea'}
				value={value}
				maxLength={maxLength}
				onChange={(event) => onChange(event.target.value)}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy(id, help, error)}
			/>
			<p className="ck-help">
				{value.length} / {maxLength} characters
			</p>
			<FieldMessages id={id} help={help} error={error} />
		</div>
	);
}

// DESIGN.md checkbox and radio: 24px control inside a 48px target, label clickable.
import { type ReactElement, useId } from 'react';
import { FieldMessages, describedBy } from './FieldParts';
import type { SelectOption } from './SelectField';

interface CheckboxFieldProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	help?: string;
	error?: string;
}

export function CheckboxField({
	label,
	checked,
	onChange,
	help,
	error,
}: CheckboxFieldProps): ReactElement {
	const id = useId();
	return (
		<div className="ck-field">
			<label className="ck-choice">
				<input
					type="checkbox"
					className="ck-checkbox"
					checked={checked}
					onChange={(event) => onChange(event.target.checked)}
					aria-describedby={describedBy(id, help, error)}
				/>
				<span>{label}</span>
			</label>
			<FieldMessages id={id} help={help} error={error} />
		</div>
	);
}

interface CheckboxGroupProps {
	legend: string;
	options: readonly SelectOption[];
	values: readonly string[];
	onChange: (values: string[]) => void;
	help?: string;
	error?: string;
}

export function CheckboxGroup({
	legend,
	options,
	values,
	onChange,
	help,
	error,
}: CheckboxGroupProps): ReactElement {
	const id = useId();
	const toggle = (value: string, isChecked: boolean): void => {
		const others = values.filter((item) => item !== value);
		onChange(isChecked ? [...others, value] : others);
	};
	return (
		<fieldset className="ck-fieldset" aria-describedby={describedBy(id, help, error)}>
			<legend className="ck-label">{legend}</legend>
			{options.map((option) => (
				<label key={option.value} className="ck-choice">
					<input
						type="checkbox"
						className="ck-checkbox"
						checked={values.includes(option.value)}
						onChange={(event) => toggle(option.value, event.target.checked)}
					/>
					<span>{option.label}</span>
				</label>
			))}
			<FieldMessages id={id} help={help} error={error} />
		</fieldset>
	);
}

interface RadioGroupProps {
	legend: string;
	options: readonly SelectOption[];
	// Null = nothing chosen yet; choices that change records are never pre-selected (DESIGN radio).
	value: string | null;
	onChange: (value: string) => void;
	help?: string;
	error?: string;
}

export function RadioGroup({
	legend,
	options,
	value,
	onChange,
	help,
	error,
}: RadioGroupProps): ReactElement {
	const id = useId();
	return (
		<fieldset
			className="ck-fieldset"
			role="radiogroup"
			aria-describedby={describedBy(id, help, error)}
		>
			<legend className="ck-label">{legend}</legend>
			{options.map((option) => (
				<label key={option.value} className="ck-choice">
					<input
						type="radio"
						className="ck-radio"
						name={id}
						value={option.value}
						checked={value === option.value}
						onChange={() => onChange(option.value)}
					/>
					<span>{option.label}</span>
				</label>
			))}
			<FieldMessages id={id} help={help} error={error} />
		</fieldset>
	);
}

// DESIGN.md date-time-input: native picker (en-AU shows DD/MM/YYYY, 24-hour), plus a "Now"
// button. Event times are never pre-filled, so a past event is not recorded as "now" by mistake.
import { type ReactElement, useId } from 'react';
import { localDateTimeValue, todayIso } from '../lib/dates';
import { Button } from './Button';
import { FieldMessages, describedBy } from './FieldParts';

interface DateTimeFieldProps {
	label: string;
	kind: 'date' | 'datetime-local';
	value: string;
	onChange: (value: string) => void;
	help?: string;
	error?: string;
}

export function DateTimeField({
	label,
	kind,
	value,
	onChange,
	help,
	error,
}: DateTimeFieldProps): ReactElement {
	const id = useId();
	const fillNow = (): void => onChange(kind === 'date' ? todayIso() : localDateTimeValue());
	return (
		<div className="ck-field">
			<label htmlFor={id} className="ck-label">
				{label}
			</label>
			<div className="ck-inline">
				<input
					id={id}
					type={kind}
					className={error ? 'ck-input ck-input--error' : 'ck-input'}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					aria-invalid={error ? true : undefined}
					aria-describedby={describedBy(id, help, error)}
				/>
				<Button onClick={fillNow}>{kind === 'date' ? 'Today' : 'Now'}</Button>
			</div>
			<FieldMessages id={id} help={help} error={error} />
		</div>
	);
}

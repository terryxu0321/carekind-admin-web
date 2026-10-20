import { type Facility, canInFacility, facilityUpdateRequestSchema } from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { useApi, useMe } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/Feedback';
import { useToast } from '../../components/Toast';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';
import { useSubmit } from '../../lib/useSubmit';
import { FacilityFields, facilityBodyFrom, facilityValuesFrom } from './FacilityFields';

interface FacilityProfileTabProps {
	facility: Facility;
	onSaved: (facility: Facility) => void;
}

export function FacilityProfileTab({ facility, onSaved }: FacilityProfileTabProps): ReactElement {
	const me = useMe();
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const [values, setValues] = useState(() => facilityValuesFrom(facility));
	const [errors, setErrors] = useState<FieldErrors>({});

	if (!canInFacility(me, facility.id, 'edit_facility')) {
		return (
			<dl className="ck-details">
				<dt>Name</dt>
				<dd>{facility.name}</dd>
				<dt>Address</dt>
				<dd>{facility.address}</dd>
				<dt>State or territory</dt>
				<dd>{facility.state}</dd>
				<dt>Beds</dt>
				<dd>{facility.beds}</dd>
				<dt>Time zone</dt>
				<dd>{facility.timezone}</dd>
			</dl>
		);
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const parsed = facilityUpdateRequestSchema.safeParse(facilityBodyFrom(values));
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			onSaved(await api.org.updateFacility(facility.id, parsed.data));
			showToast('Facility saved');
		});
	};

	return (
		<form className="ck-form ck-form--page" onSubmit={handleSubmit} noValidate>
			{submit.error ? <ErrorBanner message={submit.error} /> : null}
			<FacilityFields values={values} onChange={setValues} errors={errors} />
			<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
				Save facility
			</Button>
		</form>
	);
}

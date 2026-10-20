// PA-01: only organisation admins add facilities. A new facility starts "configuring" and
// cannot record until its go-live checklist is complete (PA-05).
import { facilityCreateRequestSchema } from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { Button, ButtonLink } from '../../components/Button';
import { ErrorBanner } from '../../components/Feedback';
import { PageHeader } from '../../components/PageHeader';
import { useToast } from '../../components/Toast';
import { canAnywhere } from '../../lib/access';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';
import { useSubmit } from '../../lib/useSubmit';
import { EMPTY_FACILITY_VALUES, FacilityFields, facilityBodyFrom } from './FacilityFields';

export function NewFacilityPage(): ReactElement {
	const me = useMe();
	const api = useApi();
	const navigate = useNavigate();
	const showToast = useToast();
	const submit = useSubmit();
	const [values, setValues] = useState(EMPTY_FACILITY_VALUES);
	const [errors, setErrors] = useState<FieldErrors>({});

	if (!canAnywhere(me, 'create_facility')) {
		return (
			<>
				<PageHeader title="Add facility" />
				<ErrorBanner message="Only organisation admins can add facilities." />
			</>
		);
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const parsed = facilityCreateRequestSchema.safeParse(facilityBodyFrom(values));
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			const facility = await api.org.createFacility(parsed.data);
			showToast('Facility added');
			navigate(`/facilities/${facility.id}`);
		});
	};

	return (
		<>
			<PageHeader
				title="Add facility"
				description="The facility starts in Configuring. Recording stays off until the go-live checklist is complete."
				actions={<ButtonLink to="/facilities">Back to facilities</ButtonLink>}
			/>
			<form className="ck-form ck-form--page" onSubmit={handleSubmit} noValidate>
				{submit.error ? <ErrorBanner message={submit.error} /> : null}
				<FacilityFields values={values} onChange={setValues} errors={errors} />
				<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
					Add facility
				</Button>
			</form>
		</>
	);
}

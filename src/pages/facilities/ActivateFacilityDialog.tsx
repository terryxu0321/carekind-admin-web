import type { Facility } from '@carekind/shared';
import type { ReactElement } from 'react';
import { useApi } from '../../auth/AuthContext';
import { FormDialog } from '../../components/FormDialog';
import { useToast } from '../../components/Toast';
import { useSubmit } from '../../lib/useSubmit';

interface ActivateFacilityDialogProps {
	facility: Facility;
	onClose: () => void;
	onActivated: (facility: Facility) => void;
}

export function ActivateFacilityDialog({
	facility,
	onClose,
	onActivated,
}: ActivateFacilityDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();

	const activate = (): void => {
		void submit.run(async () => {
			onActivated(await api.org.activateFacility(facility.id));
			showToast('Recording enabled');
		});
	};

	return (
		<FormDialog
			title={`Enable recording at ${facility.name}?`}
			submitLabel="Enable recording"
			cancelLabel="Not now"
			onSubmit={activate}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			<p>
				Trained staff at this facility will be able to dictate notes in the CareKind nurse
				app. Residents without recorded consent are never processed by AI.
			</p>
		</FormDialog>
	);
}

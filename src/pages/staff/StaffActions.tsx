// Lifecycle actions on a staff member (SPEC-011 §3.2). Which buttons appear comes from the
// shared staff state machine; every action opens its own dialog with one form.
import { type Facility, type Staff, nextStaffLifecycle } from '@carekind/shared';
import { type ReactElement, useState } from 'react';
import { Button } from '../../components/Button';
import { AssignmentsDialog } from './AssignmentsDialog';
import {
	DeactivateStaffDialog,
	InviteStaffDialog,
	TrainingCompleteDialog,
} from './StaffLifecycleDialogs';

type OpenDialog = 'assignments' | 'invite' | 'training' | 'deactivate' | null;

interface StaffActionsProps {
	staff: Staff;
	facilities: Facility[];
	onChanged: (staff: Staff) => void;
}

export function StaffActions({ staff, facilities, onChanged }: StaffActionsProps): ReactElement {
	const [open, setOpen] = useState<OpenDialog>(null);
	const close = (): void => setOpen(null);
	const changedAndClose = (next: Staff): void => {
		onChanged(next);
		setOpen(null);
	};
	// Invites only make sense for people who will use the app (tech design §3).
	const canInvite = staff.hasAppAccess && nextStaffLifecycle(staff.lifecycle, 'invite').ok;
	const canCompleteTraining = nextStaffLifecycle(staff.lifecycle, 'complete_training').ok;
	const canDeactivate = nextStaffLifecycle(staff.lifecycle, 'deactivate').ok;

	return (
		<div className="ck-toolbar ck-section" aria-label="Staff actions" role="group">
			<Button variant="utility" onClick={() => setOpen('assignments')}>
				Edit facilities and roles
			</Button>
			{canInvite ? (
				<Button variant="utility" onClick={() => setOpen('invite')}>
					{staff.lifecycle === 'invited'
						? 'Create new invite link'
						: 'Create invite link'}
				</Button>
			) : null}
			{canCompleteTraining ? (
				<Button variant="utility" onClick={() => setOpen('training')}>
					Mark training complete
				</Button>
			) : null}
			{canDeactivate ? (
				<Button variant="utility" onClick={() => setOpen('deactivate')}>
					Deactivate
				</Button>
			) : null}
			{open === 'assignments' ? (
				<AssignmentsDialog
					staff={staff}
					facilities={facilities}
					onClose={close}
					onSaved={changedAndClose}
				/>
			) : null}
			{open === 'invite' ? (
				<InviteStaffDialog staff={staff} onClose={close} onInvited={onChanged} />
			) : null}
			{open === 'training' ? (
				<TrainingCompleteDialog staff={staff} onClose={close} onSaved={changedAndClose} />
			) : null}
			{open === 'deactivate' ? (
				<DeactivateStaffDialog staff={staff} onClose={close} onSaved={changedAndClose} />
			) : null}
		</div>
	);
}

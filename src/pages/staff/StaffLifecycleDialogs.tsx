// Invite, training and deactivation dialogs (SPEC-011 §3.2). CareKind never emails invites
// (AGENTS hard rule 3): the admin copies the one-time link and passes it on themselves.
import { INVITE_VALID_DAYS, type InviteLinkResponse, type Staff } from '@carekind/shared';
import { type ReactElement, useId, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { FormDialog } from '../../components/FormDialog';
import { useToast } from '../../components/Toast';
import { formatDateTime, formatPersonName } from '../../lib/format';
import { useSubmit } from '../../lib/useSubmit';

interface StaffDialogProps {
	staff: Staff;
	onClose: () => void;
	onSaved: (staff: Staff) => void;
}

interface InviteStaffDialogProps {
	staff: Staff;
	onClose: () => void;
	// The staff record moves to "invited"; refresh it so the page shows the new status.
	onInvited: (staff: Staff) => void;
}

export function InviteStaffDialog({
	staff,
	onClose,
	onInvited,
}: InviteStaffDialogProps): ReactElement {
	const api = useApi();
	const submit = useSubmit();
	const [invite, setInvite] = useState<InviteLinkResponse | null>(null);

	if (invite !== null) {
		return <InviteLinkView invite={invite} onClose={onClose} />;
	}

	const createInvite = (): void => {
		void submit.run(async () => {
			const created = await api.org.inviteStaff(staff.id);
			setInvite(created);
			onInvited(await api.org.getStaff(staff.id));
		});
	};

	return (
		<FormDialog
			title={`Invite ${formatPersonName(staff)}`}
			submitLabel="Create invite link"
			onSubmit={createInvite}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			<p>
				CareKind does not send email. You will get a one-time link to give to this person
				yourself. The link works for {INVITE_VALID_DAYS} days. Any earlier link stops
				working.
			</p>
		</FormDialog>
	);
}

function InviteLinkView({
	invite,
	onClose,
}: {
	invite: InviteLinkResponse;
	onClose: () => void;
}): ReactElement {
	const linkId = useId();
	const [copyStatus, setCopyStatus] = useState<string | null>(null);
	const copy = (): void => {
		navigator.clipboard.writeText(invite.inviteUrl).then(
			() => setCopyStatus('Link copied.'),
			() => setCopyStatus('Copy did not work. Select the link and copy it by hand.'),
		);
	};
	return (
		<Dialog title="Invite link created" onClose={onClose}>
			<div className="ck-field">
				<label htmlFor={linkId} className="ck-label">
					Invite link
				</label>
				<input id={linkId} className="ck-input" readOnly value={invite.inviteUrl} />
				<p className="ck-help">
					Works until {formatDateTime(invite.expiresAt)}. Share it only with this person.
				</p>
				<p className="ck-help" role="status">
					{copyStatus}
				</p>
			</div>
			<div className="ck-dialog__actions">
				<Button onClick={copy}>Copy link</Button>
				<Button onClick={onClose}>Done</Button>
			</div>
		</Dialog>
	);
}

export function TrainingCompleteDialog({
	staff,
	onClose,
	onSaved,
}: StaffDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const save = (): void => {
		void submit.run(async () => {
			onSaved(await api.org.completeStaffTraining(staff.id));
			showToast('Training recorded');
		});
	};
	return (
		<FormDialog
			title="Mark CareKind training complete?"
			submitLabel="Mark training complete"
			onSubmit={save}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			<p>
				Confirm that {formatPersonName(staff)} has finished CareKind training on reviewing
				AI drafts and its limits. Untrained staff cannot record in the nurse app.
			</p>
		</FormDialog>
	);
}

export function DeactivateStaffDialog({ staff, onClose, onSaved }: StaffDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const save = (): void => {
		void submit.run(async () => {
			onSaved(await api.org.deactivateStaff(staff.id));
			showToast('Staff member deactivated');
		});
	};
	return (
		<FormDialog
			title={`Deactivate ${formatPersonName(staff)}?`}
			submitLabel="Deactivate staff member"
			cancelLabel="Keep active"
			onSubmit={save}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			<p>
				They are signed out straight away and can no longer sign in or sign records. Records
				they already signed are kept. This cannot be undone here.
			</p>
		</FormDialog>
	);
}

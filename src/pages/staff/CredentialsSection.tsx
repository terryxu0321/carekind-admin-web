// SPEC-011 PA-02a credentials. Reminders are shown as text with a neutral icon — a reminder
// only; it never decides whether someone may work, and uses no risk colours.
import { type Credential, credentialReminder } from '@carekind/shared';
import { type ReactElement, useCallback, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { type Column, DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/Feedback';
import { LoadView } from '../../components/LoadView';
import { todayIso } from '../../lib/dates';
import { formatDate } from '../../lib/format';
import { CREDENTIAL_KIND_LABELS, CREDENTIAL_REMINDER_LABELS } from '../../lib/labels';
import { useLoad } from '../../lib/useLoad';
import { CredentialDialog, RemoveCredentialDialog } from './CredentialDialogs';

const REMINDER_ICON = { none: '', due_60: '◷ ', due_30: '◷ ', expired: '! ' } as const;

function ReminderText({ credential }: { credential: Credential }): ReactElement {
	const reminder = credentialReminder(credential.expiresAt, todayIso());
	return (
		<span>
			<span aria-hidden="true">{REMINDER_ICON[reminder]}</span>
			{CREDENTIAL_REMINDER_LABELS[reminder]}
		</span>
	);
}

type CredentialDialogState =
	| { kind: 'add' }
	| { kind: 'edit'; credential: Credential }
	| { kind: 'remove'; credential: Credential }
	| null;

interface CredentialsSectionProps {
	staffId: string;
	canManage: boolean;
}

export function CredentialsSection({ staffId, canManage }: CredentialsSectionProps): ReactElement {
	const api = useApi();
	const loader = useCallback(() => api.org.listCredentials(staffId), [api, staffId]);
	const credentials = useLoad(loader);
	const [dialog, setDialog] = useState<CredentialDialogState>(null);
	const closeAndReload = (): void => {
		setDialog(null);
		credentials.reload();
	};

	const columns: Column<Credential>[] = [
		{ header: 'Credential', render: (row) => CREDENTIAL_KIND_LABELS[row.kind] },
		{ header: 'Reference', render: (row) => row.reference ?? '—' },
		{ header: 'Expires', render: (row) => formatDate(row.expiresAt) },
		{ header: 'Reminder', render: (row) => <ReminderText credential={row} /> },
	];
	if (canManage) {
		columns.push({
			header: 'Actions',
			render: (row) => (
				<span className="ck-inline">
					<Button
						variant="utility"
						onClick={() => setDialog({ kind: 'edit', credential: row })}
					>
						Edit {CREDENTIAL_KIND_LABELS[row.kind]}
					</Button>
					<Button
						variant="utility"
						onClick={() => setDialog({ kind: 'remove', credential: row })}
					>
						Remove {CREDENTIAL_KIND_LABELS[row.kind]}
					</Button>
				</span>
			),
		});
	}

	return (
		<section className="ck-section" aria-labelledby="credentials-heading">
			<div className="ck-section-header">
				<h2 id="credentials-heading" className="ck-section-title">
					Credentials and screening
				</h2>
				{canManage ? (
					<Button onClick={() => setDialog({ kind: 'add' })}>Add credential</Button>
				) : null}
			</div>
			<p className="ck-help">
				Reminders appear 60 and 30 days before expiry. They never deactivate anyone; your
				facility decides who may work.
			</p>
			<LoadView result={credentials} loadingLabel="Loading credentials…">
				{(rows) =>
					rows.length === 0 ? (
						<EmptyState
							title="No credentials recorded"
							body="Add Ahpra registration, worker screening or police check expiry dates to get reminders."
						/>
					) : (
						<DataTable
							caption="Credentials"
							columns={columns}
							rows={rows}
							rowKey={(row) => row.id}
						/>
					)
				}
			</LoadView>
			{dialog?.kind === 'add' ? (
				<CredentialDialog
					staffId={staffId}
					credential={null}
					onClose={() => setDialog(null)}
					onSaved={closeAndReload}
				/>
			) : null}
			{dialog?.kind === 'edit' ? (
				<CredentialDialog
					staffId={staffId}
					credential={dialog.credential}
					onClose={() => setDialog(null)}
					onSaved={closeAndReload}
				/>
			) : null}
			{dialog?.kind === 'remove' ? (
				<RemoveCredentialDialog
					staffId={staffId}
					credential={dialog.credential}
					onClose={() => setDialog(null)}
					onRemoved={closeAndReload}
				/>
			) : null}
		</section>
	);
}

// PA-07 audit log (append-only on the server). Summaries never contain health information
// or resident names (tech design §3), so they are shown as they are.
import type { AuditActorType, AuditEntry } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { useApi, useMe } from '../auth/AuthContext';
import { type Column, DataTable } from '../components/DataTable';
import { EmptyState, ErrorBanner } from '../components/Feedback';
import { LoadView } from '../components/LoadView';
import { PageHeader } from '../components/PageHeader';
import { canAnywhere } from '../lib/access';
import { formatDateTime } from '../lib/format';
import { useLoad } from '../lib/useLoad';

const ACTOR_LABELS: Record<AuditActorType, string> = {
	staff: 'Staff member',
	platform_admin: 'CareKind platform admin',
};

const COLUMNS: readonly Column<AuditEntry>[] = [
	{ header: 'When', render: (row) => formatDateTime(row.occurredAt) },
	{ header: 'By', render: (row) => ACTOR_LABELS[row.actorType] },
	{ header: 'Action', render: (row) => row.action },
	{ header: 'Record type', render: (row) => row.entity },
	{ header: 'Summary', render: (row) => row.summary },
];

export function AuditPage(): ReactElement {
	const me = useMe();
	if (!canAnywhere(me, 'view_audit')) {
		return (
			<>
				<PageHeader title="Audit log" />
				<ErrorBanner message="Only organisation admins and facility managers can view the audit log." />
			</>
		);
	}
	return <AuditLog />;
}

function AuditLog(): ReactElement {
	const api = useApi();
	const loader = useCallback(() => api.org.listAudit(), [api]);
	const audit = useLoad(loader);
	return (
		<>
			<PageHeader
				title="Audit log"
				description="Every change to staff, residents, consent and workflow settings. Entries cannot be edited or deleted."
			/>
			<LoadView result={audit} loadingLabel="Loading audit log…">
				{(rows) =>
					rows.length === 0 ? (
						<EmptyState
							title="No changes recorded yet"
							body="Changes appear here as soon as anyone makes them."
						/>
					) : (
						<DataTable
							caption="Audit log"
							columns={COLUMNS}
							rows={rows}
							rowKey={(row) => row.id}
						/>
					)
				}
			</LoadView>
		</>
	);
}

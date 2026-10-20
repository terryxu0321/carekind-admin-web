// SPEC-009 consent: status, who gave it, which state's rules and the basis. Unknown (or no
// record) is always treated as not consented; staff can never choose "Unknown" themselves.
import { type AustralianState, type Consent, isRecordingConsented } from '@carekind/shared';
import { type ReactElement, useCallback, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { LoadView } from '../../components/LoadView';
import { formatDateTime } from '../../lib/format';
import { CONSENT_SOURCE_LABELS, CONSENT_STATUS_LABELS } from '../../lib/labels';
import { useLoad } from '../../lib/useLoad';
import { ConsentDialog } from './ConsentDialog';

interface ConsentSectionProps {
	residentId: string;
	canManage: boolean;
	defaultJurisdiction: AustralianState | null;
}

export function ConsentSection({
	residentId,
	canManage,
	defaultJurisdiction,
}: ConsentSectionProps): ReactElement {
	const api = useApi();
	const loader = useCallback(() => api.org.getConsent(residentId), [api, residentId]);
	const consent = useLoad(loader);
	const [isEditing, setIsEditing] = useState(false);

	return (
		<section className="ck-section" aria-labelledby="consent-heading">
			<div className="ck-section-header">
				<h2 id="consent-heading" className="ck-section-title">
					Consent to AI processing
				</h2>
				{canManage ? (
					<Button onClick={() => setIsEditing(true)}>Record consent decision</Button>
				) : null}
			</div>
			<LoadView result={consent} loadingLabel="Loading consent…">
				{(data) => <ConsentDetails consent={data} />}
			</LoadView>
			{isEditing ? (
				<ConsentDialog
					residentId={residentId}
					current={consent.state.status === 'ready' ? consent.state.data : null}
					defaultJurisdiction={defaultJurisdiction}
					onClose={() => setIsEditing(false)}
					onSaved={(saved) => {
						consent.replace(saved);
						setIsEditing(false);
					}}
				/>
			) : null}
		</section>
	);
}

function ConsentDetails({ consent }: { consent: Consent }): ReactElement {
	return (
		<>
			<p className="ck-help">
				{isRecordingConsented(consent.status)
					? 'AI may process dictated notes about this resident.'
					: 'AI will not process notes about this resident. Staff are asked to write notes by hand.'}
			</p>
			<dl className="ck-details">
				<dt>Status</dt>
				<dd>{CONSENT_STATUS_LABELS[consent.status]}</dd>
				<dt>Given by</dt>
				<dd>{consent.source === null ? '—' : CONSENT_SOURCE_LABELS[consent.source]}</dd>
				<dt>State rules applied</dt>
				<dd>{consent.jurisdiction ?? '—'}</dd>
				<dt>Basis and document reference</dt>
				<dd>{consent.basisNote ?? '—'}</dd>
				<dt>Recorded</dt>
				<dd>{formatDateTime(consent.recordedAt)}</dd>
			</dl>
		</>
	);
}

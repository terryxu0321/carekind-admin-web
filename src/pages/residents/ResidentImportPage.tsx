import { RESIDENT_CSV_COLUMNS, canInFacility } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { useApi, useMe } from '../../auth/AuthContext';
import { ButtonLink } from '../../components/Button';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { useFacilities } from '../../lib/useFacilities';
import { CsvImportForm } from '../CsvImportForm';
import { useFacilityParam } from './useFacilityParam';

export function ResidentImportPage(): ReactElement {
	const me = useMe();
	const api = useApi();
	const [facilityId] = useFacilityParam();
	const facilities = useFacilities();
	const importResidents = useCallback(
		(targetId: string, csv: string) => api.org.importResidents(targetId, csv),
		[api],
	);

	return (
		<>
			<PageHeader
				title="Import residents"
				description="A blank status means the person already lives at the facility. Consent starts as Unknown and is treated as not consented until you record a decision."
				actions={
					<ButtonLink to={`/residents?facilityId=${facilityId}`}>
						Back to residents
					</ButtonLink>
				}
			/>
			<LoadView result={facilities} loadingLabel="Loading facilities…">
				{(all) => (
					<CsvImportForm
						facilities={all.filter((facility) =>
							canInFacility(me, facility.id, 'manage_residents'),
						)}
						initialFacilityId={facilityId}
						columns={RESIDENT_CSV_COLUMNS}
						noun="residents"
						submitLabel="Import residents"
						onImport={importResidents}
					/>
				)}
			</LoadView>
		</>
	);
}

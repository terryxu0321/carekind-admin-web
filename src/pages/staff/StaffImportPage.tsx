import { STAFF_CSV_COLUMNS, canInFacility } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi, useMe } from '../../auth/AuthContext';
import { ButtonLink } from '../../components/Button';
import { LoadView } from '../../components/LoadView';
import { PageHeader } from '../../components/PageHeader';
import { useFacilities } from '../../lib/useFacilities';
import { CsvImportForm } from '../CsvImportForm';

export function StaffImportPage(): ReactElement {
	const me = useMe();
	const api = useApi();
	const [searchParams] = useSearchParams();
	const facilities = useFacilities();
	const importStaff = useCallback(
		(facilityId: string, csv: string) => api.org.importStaff(facilityId, csv),
		[api],
	);

	return (
		<>
			<PageHeader
				title="Import staff"
				description="Each row is added to the facility you choose, with the role in the file. Include staff who do not use the app."
				actions={<ButtonLink to="/staff">Back to staff</ButtonLink>}
			/>
			<LoadView result={facilities} loadingLabel="Loading facilities…">
				{(all) => (
					<CsvImportForm
						facilities={all.filter((facility) =>
							canInFacility(me, facility.id, 'manage_staff'),
						)}
						initialFacilityId={searchParams.get('facilityId') ?? ''}
						columns={STAFF_CSV_COLUMNS}
						noun="staff members"
						submitLabel="Import staff"
						onImport={importStaff}
					/>
				)}
			</LoadView>
		</>
	);
}

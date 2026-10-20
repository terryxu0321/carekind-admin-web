// The resident pages keep the chosen facility in the URL (?facilityId=) so links and reloads keep it.
import { useSearchParams } from 'react-router-dom';

export function useFacilityParam(): [string, (facilityId: string) => void] {
	const [searchParams, setSearchParams] = useSearchParams();
	const facilityId = searchParams.get('facilityId') ?? '';
	const setFacilityId = (next: string): void =>
		setSearchParams(next === '' ? {} : { facilityId: next }, { replace: true });
	return [facilityId, setFacilityId];
}

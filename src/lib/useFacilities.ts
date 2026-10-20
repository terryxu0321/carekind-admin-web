// Facilities this person can see (the API scopes the list to their organisation and facilities).
import type { Facility } from '@carekind/shared';
import { useCallback } from 'react';
import { useApi } from '../auth/AuthContext';
import { type LoadResult, useLoad } from './useLoad';

export function useFacilities(): LoadResult<Facility[]> {
	const api = useApi();
	const loader = useCallback(() => api.org.listFacilities(), [api]);
	return useLoad(loader);
}

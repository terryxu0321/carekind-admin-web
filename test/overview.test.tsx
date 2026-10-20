// PA-06 / PA-06a: facility-level figures only; nurse-app metrics are labelled unavailable.
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './render-app';
import { ME_ORG_ADMIN, OVERVIEW_ROWS, STAFF_MEMBER, baseRoutes } from './synthetic-data';

const NOT_AVAILABLE = 'Not yet available — nurse app not live';

describe('company overview', () => {
	it('should_label_nurse_app_metrics_as_not_yet_available', async () => {
		renderApp({ path: '/', me: ME_ORG_ADMIN, routes: baseRoutes() });
		const table = await screen.findByRole('table', { name: 'Facility overview' });
		// Three nurse-app metrics per facility.
		expect(within(table).getAllByText(NOT_AVAILABLE)).toHaveLength(3 * OVERVIEW_ROWS.length);
		expect(within(table).getByText('75%')).toBeTruthy();
		expect(within(table).getByText('80%')).toBeTruthy();
		expect(within(table).getByText('No residents')).toBeTruthy();
	});

	it('should_show_one_row_per_facility_and_no_per_person_data', async () => {
		const api = renderApp({ path: '/', me: ME_ORG_ADMIN, routes: baseRoutes() });
		const table = await screen.findByRole('table', { name: 'Facility overview' });
		const bodyRows = within(table).getAllByRole('row').slice(1);
		expect(bodyRows).toHaveLength(OVERVIEW_ROWS.length);
		expect(within(table).queryByText(new RegExp(STAFF_MEMBER.familyName))).toBeNull();
		const headers = within(table)
			.getAllByRole('columnheader')
			.map((header) => header.textContent ?? '');
		expect(headers.some((header) => /staff member|nurse name|rank/i.test(header))).toBe(false);
		// The overview never asks for staff or resident lists.
		expect(api.calls.map((call) => call.path)).toEqual(['/org/overview']);
	});
});

// DESIGN.md §7.3: one page = one form = one submit; list pages have no submit at all.
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectAtMostOneForm, expectNoForm, renderApp } from './render-app';
import { FACILITY_NSW_ID, ME_ORG_ADMIN, RESIDENT_ID, STAFF_ID, baseRoutes } from './synthetic-data';

interface PageCase {
	path: string;
	heading: string;
}

const LIST_PAGES: PageCase[] = [
	{ path: '/', heading: 'Overview' },
	{ path: '/facilities', heading: 'Facilities' },
	{ path: '/staff', heading: 'Staff' },
	{ path: '/residents', heading: 'Residents' },
	{ path: '/audit', heading: 'Audit log' },
];

const FORM_PAGES: PageCase[] = [
	{ path: '/facilities/new', heading: 'Add facility' },
	{ path: `/facilities/${FACILITY_NSW_ID}`, heading: 'Synthetic Harbour House' },
	{ path: '/staff/new', heading: 'Add staff member' },
	{ path: '/staff/import', heading: 'Import staff' },
	{ path: `/staff/${STAFF_ID}`, heading: 'Fictiona Nurseworth' },
	{ path: `/residents/new?facilityId=${FACILITY_NSW_ID}`, heading: 'Add resident' },
	{ path: `/residents/import?facilityId=${FACILITY_NSW_ID}`, heading: 'Import residents' },
	{ path: `/residents/${RESIDENT_ID}`, heading: 'Imagina Testperson' },
];

describe('one form per page', () => {
	it.each(LIST_PAGES)('list page $path has no form and no submit button', async (page) => {
		const { container } = renderApp({
			path: page.path,
			me: ME_ORG_ADMIN,
			routes: baseRoutes(),
		});
		await screen.findByRole('heading', { level: 1, name: page.heading });
		await screen.findByRole('table');
		expectNoForm(container);
	});

	it.each(FORM_PAGES)('page $path has at most one form and one submit', async (page) => {
		const { container } = renderApp({
			path: page.path,
			me: ME_ORG_ADMIN,
			routes: baseRoutes(),
		});
		await screen.findByRole('heading', { level: 1, name: page.heading });
		await screen.findAllByRole('button');
		expectAtMostOneForm(container);
	});

	it('facility detail keeps one form on every tab', async () => {
		const { container } = renderApp({
			path: `/facilities/${FACILITY_NSW_ID}`,
			me: ME_ORG_ADMIN,
			routes: baseRoutes(),
		});
		await screen.findByRole('heading', { level: 1, name: 'Synthetic Harbour House' });
		for (const tab of ['Profile', 'Go-live checklist', 'Workflow settings']) {
			fireEvent.click(screen.getByRole('tab', { name: tab }));
			await screen.findAllByRole('button');
			expectAtMostOneForm(container);
		}
		expect(await screen.findByRole('form', { name: 'Workflow settings' })).toBeTruthy();
	});

	it('sign-in and accept-invite pages have one form each', async () => {
		const login = renderApp({ path: '/login', me: null, routes: {} });
		await screen.findByRole('heading', { name: 'Sign in to CareKind Admin' });
		expectAtMostOneForm(login.container);
		login.unmount();
		const invite = renderApp({ path: '/accept-invite?token=abc', me: null, routes: {} });
		await screen.findByRole('heading', { name: 'Set your password' });
		expectAtMostOneForm(invite.container);
	});
});

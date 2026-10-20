// Tech design §2 permission table, applied to what the UI shows (the API still enforces).
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './render-app';
import {
	FACILITY_NSW_ID,
	ME_ADMIN_OFFICER,
	ME_DON,
	ME_FACILITY_MANAGER,
	STAFF_ID,
	baseRoutes,
} from './synthetic-data';

describe('role-based visibility', () => {
	it('should_hide_workflow_settings_from_admin_officer', async () => {
		renderApp({
			path: `/facilities/${FACILITY_NSW_ID}`,
			me: ME_ADMIN_OFFICER,
			routes: baseRoutes(),
		});
		await screen.findByRole('heading', { level: 1, name: 'Synthetic Harbour House' });
		expect(screen.queryByRole('tab', { name: 'Workflow settings' })).toBeNull();
		expect(screen.queryByRole('form', { name: 'Workflow settings' })).toBeNull();
	});

	it('should_show_workflow_settings_to_facility_manager', async () => {
		renderApp({
			path: `/facilities/${FACILITY_NSW_ID}`,
			me: ME_FACILITY_MANAGER,
			routes: baseRoutes(),
		});
		fireEvent.click(await screen.findByRole('tab', { name: 'Workflow settings' }));
		expect(await screen.findByRole('form', { name: 'Workflow settings' })).toBeTruthy();
	});

	it('should_not_let_don_edit_staff', async () => {
		const { container } = renderApp({
			path: `/staff/${STAFF_ID}`,
			me: ME_DON,
			routes: baseRoutes(),
		});
		await screen.findByRole('heading', { level: 1, name: 'Fictiona Nurseworth' });
		await screen.findByRole('table', { name: 'Credentials' });
		expect(screen.queryByRole('form', { name: 'Staff profile' })).toBeNull();
		expect(container.querySelectorAll('input, select, textarea')).toHaveLength(0);
		expect(screen.queryByRole('button', { name: 'Edit facilities and roles' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Deactivate' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Add credential' })).toBeNull();
	});

	it('should_hide_staff_and_audit_navigation_from_don', async () => {
		renderApp({ path: '/', me: ME_DON, routes: baseRoutes() });
		const nav = await screen.findByRole('navigation', { name: 'Main' });
		expect(within(nav).queryByRole('link', { name: 'Staff' })).toBeNull();
		expect(within(nav).queryByRole('link', { name: 'Audit log' })).toBeNull();
		expect(within(nav).getByRole('link', { name: 'Residents' })).toBeTruthy();
	});

	it('should_hide_add_facility_from_facility_roles', async () => {
		renderApp({ path: '/facilities', me: ME_FACILITY_MANAGER, routes: baseRoutes() });
		await screen.findByRole('table', { name: 'Facilities' });
		expect(screen.queryByRole('link', { name: 'Add facility' })).toBeNull();
	});
});

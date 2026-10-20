// SPEC-009: staff record a decision; "unknown" can never be submitted from the UI.
import type { Consent } from '@carekind/shared';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './render-app';
import { ME_ID, ME_ORG_ADMIN, RESIDENT_ID, baseRoutes } from './synthetic-data';

async function openConsentDialog(): Promise<HTMLElement> {
	fireEvent.click(await screen.findByRole('button', { name: 'Record consent decision' }));
	return screen.findByRole('dialog', { name: 'Record consent decision' });
}

describe('consent dialog', () => {
	it('should_never_offer_unknown_as_a_choice', async () => {
		renderApp({ path: `/residents/${RESIDENT_ID}`, me: ME_ORG_ADMIN, routes: baseRoutes() });
		const dialog = await openConsentDialog();
		const decision = within(dialog).getByRole('radiogroup', { name: 'Decision' });
		const labels = within(decision)
			.getAllByRole('radio')
			.map((radio) => radio.closest('label')?.textContent ?? '');
		expect(labels).toEqual(['Consented', 'Not consented', 'Withdrawn']);
		expect(labels.some((label) => label.toLowerCase().includes('unknown'))).toBe(false);
	});

	it('should_not_submit_without_a_chosen_decision', async () => {
		const api = renderApp({
			path: `/residents/${RESIDENT_ID}`,
			me: ME_ORG_ADMIN,
			routes: baseRoutes(),
		});
		const dialog = await openConsentDialog();
		fireEvent.click(within(dialog).getByRole('button', { name: 'Save consent decision' }));
		expect(await within(dialog).findAllByText('Choose or enter a value.')).not.toHaveLength(0);
		expect(api.calls.some((call) => call.method === 'PUT')).toBe(false);
	});

	it('should_save_a_recorded_decision_with_source_and_jurisdiction', async () => {
		const saved: Consent = {
			residentId: RESIDENT_ID,
			status: 'consented',
			source: 'substitute_decision_maker',
			jurisdiction: 'NSW',
			basisNote: null,
			recordedBy: ME_ID,
			recordedAt: '2026-10-01T09:00:00.000Z',
		};
		const api = renderApp({
			path: `/residents/${RESIDENT_ID}`,
			me: ME_ORG_ADMIN,
			routes: { ...baseRoutes(), [`PUT /org/residents/${RESIDENT_ID}/consent`]: saved },
		});
		const dialog = await openConsentDialog();
		fireEvent.click(within(dialog).getByRole('radio', { name: 'Consented' }));
		fireEvent.click(within(dialog).getByRole('radio', { name: 'Substitute decision-maker' }));
		fireEvent.click(within(dialog).getByRole('button', { name: 'Save consent decision' }));
		await screen.findByText('Substitute decision-maker');
		const put = api.calls.find((call) => call.method === 'PUT');
		expect(put?.body).toEqual({
			status: 'consented',
			source: 'substitute_decision_maker',
			jurisdiction: 'NSW',
			basisNote: null,
		});
	});
});

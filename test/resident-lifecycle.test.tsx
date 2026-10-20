// SPEC-011 §3.1: the lifecycle dialog offers only events the shared state machine allows.
import {
	RESIDENT_STATUSES,
	type ResidentEventResult,
	type ResidentStatus,
	allowedResidentEvents,
} from '@carekind/shared';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RESIDENT_EVENT_LABELS } from '../src/lib/labels';
import { renderApp } from './render-app';
import {
	FACILITY_NSW_ID,
	FACILITY_VIC_ID,
	ME_ORG_ADMIN,
	ME_ID,
	RESIDENT_ID,
	baseRoutes,
	makeResident,
} from './synthetic-data';

function routesFor(status: ResidentStatus): Record<string, unknown> {
	return { ...baseRoutes(), [`GET /org/residents/${RESIDENT_ID}`]: makeResident(status) };
}

const STATUSES_WITH_EVENTS = RESIDENT_STATUSES.filter(
	(status) => allowedResidentEvents(status).length > 0,
);

describe('resident lifecycle dialog', () => {
	it.each(STATUSES_WITH_EVENTS)('offers only allowed events when %s', async (status) => {
		renderApp({
			path: `/residents/${RESIDENT_ID}`,
			me: ME_ORG_ADMIN,
			routes: routesFor(status),
		});
		fireEvent.click(await screen.findByRole('button', { name: 'Record lifecycle event' }));
		const dialog = await screen.findByRole('dialog', { name: 'Record lifecycle event' });
		const offered = within(dialog)
			.getAllByRole('radio')
			.map((radio) => radio.closest('label')?.textContent);
		expect(offered).toEqual(
			allowedResidentEvents(status).map((type) => RESIDENT_EVENT_LABELS[type]),
		);
	});

	it('should_offer_no_event_button_for_archived_resident', async () => {
		renderApp({
			path: `/residents/${RESIDENT_ID}`,
			me: ME_ORG_ADMIN,
			routes: routesFor('archived'),
		});
		await screen.findByRole('heading', { level: 1, name: 'Imagina Testperson' });
		expect(screen.queryByRole('button', { name: 'Record lifecycle event' })).toBeNull();
		expect(screen.queryByRole('form', { name: 'Resident profile' })).toBeNull();
	});

	it('should_prompt_consent_reconfirmation_after_cross_state_transfer', async () => {
		const accepted = makeResident('in_residence', FACILITY_VIC_ID);
		const result: ResidentEventResult = {
			resident: accepted,
			event: {
				id: '00000000-0000-4000-8000-0000000000f1',
				residentId: RESIDENT_ID,
				type: 'transfer_accept',
				fromFacilityId: FACILITY_NSW_ID,
				toFacilityId: FACILITY_VIC_ID,
				occurredAt: '2026-10-01T09:00:00.000Z',
				recordedBy: ME_ID,
			},
			consentReset: true,
			crossStateTransfer: true,
		};
		const api = renderApp({
			path: `/residents/${RESIDENT_ID}`,
			me: ME_ORG_ADMIN,
			routes: {
				...routesFor('transferring'),
				[`POST /org/residents/${RESIDENT_ID}/events`]: result,
			},
		});
		fireEvent.click(await screen.findByRole('button', { name: 'Record lifecycle event' }));
		const dialog = await screen.findByRole('dialog');
		fireEvent.click(within(dialog).getByRole('radio', { name: 'Accept transfer' }));
		fireEvent.change(within(dialog).getByLabelText('When it happened'), {
			target: { value: '2026-10-01T09:00' },
		});
		fireEvent.click(within(dialog).getByRole('button', { name: 'Record event' }));
		expect(
			await screen.findByText("Re-confirm consent under the new state's rules"),
		).toBeTruthy();
		const post = api.calls.find((call) => call.method === 'POST');
		expect(post?.body).toMatchObject({ type: 'transfer_accept' });
	});
});

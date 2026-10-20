// PA-05: recording cannot be enabled until the checklist is complete and, in NSW, written
// staff notice was given at least 14 days earlier.
import { NSW_STAFF_NOTICE_DAYS, addDays } from '@carekind/shared';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { todayIso } from '../src/lib/dates';
import { formatDate } from '../src/lib/format';
import { renderApp } from './render-app';
import {
	FACILITY_NSW_ID,
	ME_DON,
	ME_ORG_ADMIN,
	baseRoutes,
	goLiveItems,
	makeGoLive,
} from './synthetic-data';

const NOTICE_DAYS_AGO = 5;

async function openGoLiveTab(routes: Record<string, unknown>, me = ME_ORG_ADMIN): Promise<void> {
	renderApp({ path: `/facilities/${FACILITY_NSW_ID}`, me, routes });
	fireEvent.click(await screen.findByRole('tab', { name: 'Go-live checklist' }));
	await screen.findByRole('table', { name: 'Go-live checklist' });
}

function routesWith(incomplete: string[], noticeDaysAgo: number): Record<string, unknown> {
	return {
		...baseRoutes(),
		[`GET /org/facilities/${FACILITY_NSW_ID}/go-live`]: makeGoLive(
			goLiveItems(incomplete, noticeDaysAgo),
		),
	};
}

describe('go-live activation', () => {
	it('should_disable_activation_and_list_blockers', async () => {
		await openGoLiveTab(routesWith(['contract_signed'], NOTICE_DAYS_AGO));
		const button = screen.getByRole('button', { name: 'Enable recording' });
		expect((button as HTMLButtonElement).disabled).toBe(true);
		expect(screen.getByText('Contract signed is not complete.')).toBeTruthy();
		const earliest = formatDate(addDays(todayIso(), NSW_STAFF_NOTICE_DAYS - NOTICE_DAYS_AGO));
		expect(screen.getByText(new RegExp(`Recording can start on ${earliest}`))).toBeTruthy();
	});

	it('should_enable_activation_when_checklist_and_nsw_notice_are_complete', async () => {
		await openGoLiveTab(routesWith([], NSW_STAFF_NOTICE_DAYS + 1));
		const button = screen.getByRole('button', { name: 'Enable recording' });
		expect((button as HTMLButtonElement).disabled).toBe(false);
		expect(screen.queryByText('Recording cannot start yet:')).toBeNull();
	});

	it('should_not_offer_activation_or_item_updates_to_don', async () => {
		await openGoLiveTab(routesWith([], NSW_STAFF_NOTICE_DAYS + 1), ME_DON);
		expect(screen.queryByRole('button', { name: 'Enable recording' })).toBeNull();
		expect(screen.queryByRole('button', { name: /^Update / })).toBeNull();
	});
});

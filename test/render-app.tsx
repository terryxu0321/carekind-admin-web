// Renders the real app routes against a fake API. Responses go through createApiClient, so
// every fixture is also checked against the shared zod contract.
import type { OrgMe } from '@carekind/shared';
import { type RenderResult, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'vitest';
import { AppRoutes } from '../src/AppRoutes';
import { AuthProvider } from '../src/auth/AuthContext';
import { ToastProvider } from '../src/components/Toast';

const API_BASE_URL = 'http://api.test';
const API_PREFIX = '/api/v1';

export interface RecordedCall {
	method: string;
	path: string;
	body: unknown;
}

// Key: "METHOD /path" (no /api/v1 prefix, no query string).
export type FakeRoutes = Record<string, unknown>;

export interface FakeApi {
	fetchImpl: typeof fetch;
	calls: RecordedCall[];
}

function jsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function createFakeApi(routes: FakeRoutes): FakeApi {
	const calls: RecordedCall[] = [];
	const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		const url = new URL(String(input));
		const path = url.pathname.replace(API_PREFIX, '');
		const method = init?.method ?? 'GET';
		const body = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
		calls.push({ method, path, body });
		const key = `${method} ${path}`;
		if (!(key in routes)) {
			return jsonResponse(404, {
				error: { code: 'not_found', message: `No fake for ${key}` },
			});
		}
		return jsonResponse(200, routes[key]);
	};
	return { fetchImpl, calls };
}

interface RenderAppOptions {
	path: string;
	me: OrgMe | null;
	routes: FakeRoutes;
}

export function renderApp({ path, me, routes }: RenderAppOptions): RenderResult & FakeApi {
	const api = createFakeApi(routes);
	const session =
		me === null
			? null
			: {
					accessToken: 'test',
					expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
					me,
				};
	const result = render(
		<MemoryRouter initialEntries={[path]}>
			<AuthProvider baseUrl={API_BASE_URL} initialSession={session} fetchImpl={api.fetchImpl}>
				<ToastProvider>
					<AppRoutes />
				</ToastProvider>
			</AuthProvider>
		</MemoryRouter>,
	);
	return { ...result, ...api };
}

// DESIGN.md §7.3: a page has at most one form and one submit button.
export function expectAtMostOneForm(container: HTMLElement): void {
	expect(container.querySelectorAll('form').length).toBeLessThanOrEqual(1);
	expect(
		container.querySelectorAll('button[type="submit"], input[type="submit"]').length,
	).toBeLessThanOrEqual(1);
}

export function expectNoForm(container: HTMLElement): void {
	expect(container.querySelectorAll('form')).toHaveLength(0);
	expect(container.querySelectorAll('button[type="submit"], input[type="submit"]')).toHaveLength(
		0,
	);
}

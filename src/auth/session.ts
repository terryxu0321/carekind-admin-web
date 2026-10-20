// The session token lives in memory and sessionStorage (cleared when the tab closes), never in
// localStorage, so a shared office computer does not keep people signed in.
import { type LoginResponse, type OrgMe, loginResponseSchema } from '@carekind/shared';

const STORAGE_KEY = 'carekind-admin-session';

export interface Session {
	accessToken: string;
	expiresAt: string;
	me: OrgMe;
}

// This console is for organisation staff only; a platform session is not accepted here.
export function sessionFromLogin(response: LoginResponse): Session | null {
	if (response.me.audience !== 'org') {
		return null;
	}
	return { accessToken: response.accessToken, expiresAt: response.expiresAt, me: response.me };
}

function isExpired(session: Session, now: Date): boolean {
	return new Date(session.expiresAt).getTime() <= now.getTime();
}

function parseStored(raw: string): unknown {
	try {
		return JSON.parse(raw);
	} catch {
		// A corrupted entry is treated as signed out; it is overwritten on the next sign-in.
		return null;
	}
}

export function readStoredSession(now: Date = new Date()): Session | null {
	const raw = window.sessionStorage.getItem(STORAGE_KEY);
	if (raw === null) {
		return null;
	}
	const parsed = loginResponseSchema.safeParse(parseStored(raw));
	const session = parsed.success ? sessionFromLogin(parsed.data) : null;
	if (session === null || isExpired(session, now)) {
		clearStoredSession();
		return null;
	}
	return session;
}

export function storeSession(session: Session): void {
	window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
	window.sessionStorage.removeItem(STORAGE_KEY);
}

// Holds the signed-in session and the one API client every page uses. Any 401 on an
// authenticated request ends the session, and RequireAuth sends the user back to sign in.
import { type ApiClient, type LoginResponse, type OrgMe, createApiClient } from '@carekind/shared';
import {
	type ReactElement,
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import { type Session, clearStoredSession, sessionFromLogin, storeSession } from './session';

const UNAUTHORIZED_STATUS = 401;

// The API client reads the token on every request, outside React rendering, so it lives in a
// small mutable holder rather than in React state.
interface TokenHolder {
	get: () => string | null;
	set: (token: string | null) => void;
}

function createTokenHolder(initial: string | null): TokenHolder {
	let token = initial;
	return {
		get: () => token,
		set: (next) => {
			token = next;
		},
	};
}

interface AuthContextValue {
	session: Session | null;
	api: ApiClient;
	// Returns false when the account is not an organisation account (e.g. a platform admin).
	signIn: (response: LoginResponse) => boolean;
	signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
	baseUrl: string;
	initialSession: Session | null;
	// Injectable for tests; defaults to the browser fetch.
	fetchImpl?: typeof fetch;
	children: ReactNode;
}

export function AuthProvider({
	baseUrl,
	initialSession,
	fetchImpl,
	children,
}: AuthProviderProps): ReactElement {
	const [session, setSession] = useState<Session | null>(initialSession);
	const [tokens] = useState(() => createTokenHolder(initialSession?.accessToken ?? null));

	const signOut = useCallback(() => {
		tokens.set(null);
		clearStoredSession();
		setSession(null);
	}, [tokens]);

	const signIn = useCallback(
		(response: LoginResponse) => {
			const next = sessionFromLogin(response);
			if (next === null) {
				return false;
			}
			tokens.set(next.accessToken);
			storeSession(next);
			setSession(next);
			return true;
		},
		[tokens],
	);

	const api = useMemo(() => {
		const baseFetch = fetchImpl ?? globalThis.fetch.bind(globalThis);
		const fetchWithSessionCheck = async (
			input: RequestInfo | URL,
			init?: RequestInit,
		): Promise<Response> => {
			const hadToken = tokens.get() !== null;
			const response = await baseFetch(input, init);
			if (response.status === UNAUTHORIZED_STATUS && hadToken) {
				signOut();
			}
			return response;
		};
		return createApiClient({
			baseUrl,
			getToken: tokens.get,
			fetchImpl: fetchWithSessionCheck,
		});
	}, [baseUrl, fetchImpl, signOut, tokens]);

	const value = useMemo(
		() => ({ session, api, signIn, signOut }),
		[session, api, signIn, signOut],
	);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const value = useContext(AuthContext);
	if (value === null) {
		throw new Error('useAuth must be used inside <AuthProvider>');
	}
	return value;
}

export function useApi(): ApiClient {
	return useAuth().api;
}

// Only for pages behind RequireAuth, where a session always exists.
export function useMe(): OrgMe {
	const { session } = useAuth();
	if (session === null) {
		throw new Error('useMe must be used on a signed-in page');
	}
	return session.me;
}

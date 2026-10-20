// Organisation staff sign-in (tech design §4: POST /auth/login with audience "org").
import { loginRequestSchema } from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApi, useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/Feedback';
import { TextField } from '../components/TextField';
import { type FieldErrors, fieldErrorsFrom } from '../lib/validation';
import { useSubmit } from '../lib/useSubmit';

const PLATFORM_ACCOUNT_MESSAGE =
	'This is a CareKind platform account. Sign in to the Super Admin console instead.';

function redirectTarget(state: unknown): string {
	if (typeof state === 'object' && state !== null && 'from' in state) {
		const from = (state as { from: unknown }).from;
		return typeof from === 'string' && from !== '/login' ? from : '/';
	}
	return '/';
}

export function LoginPage(): ReactElement {
	const { session, signIn } = useAuth();
	const api = useApi();
	const navigate = useNavigate();
	const location = useLocation();
	const submit = useSubmit();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState<FieldErrors>({});

	if (session !== null) {
		return <Navigate to="/" replace />;
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const parsed = loginRequestSchema.safeParse({ audience: 'org', email, password });
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		setErrors({});
		void submit.run(async () => {
			const response = await api.auth.login(parsed.data);
			if (!signIn(response)) {
				submit.setError(PLATFORM_ACCOUNT_MESSAGE);
				return;
			}
			navigate(redirectTarget(location.state), { replace: true });
		});
	};

	return (
		<main className="ck-auth">
			<div className="ck-auth__card">
				<h1 className="ck-page-title">Sign in to CareKind Admin</h1>
				<form className="ck-form" onSubmit={handleSubmit} noValidate>
					{submit.error ? <ErrorBanner message={submit.error} /> : null}
					<TextField
						label="Email"
						type="email"
						autoComplete="username"
						value={email}
						onChange={setEmail}
						error={errors.email}
					/>
					<TextField
						label="Password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={setPassword}
						error={errors.password}
					/>
					<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
						Sign in
					</Button>
				</form>
			</div>
		</main>
	);
}

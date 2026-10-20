// Invite links are copied by the inviter (never emailed by CareKind); the token arrives in the URL.
import { PASSWORD_MIN_LENGTH, acceptInviteRequestSchema } from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi, useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/Feedback';
import { TextField } from '../components/TextField';
import { type FieldErrors, fieldErrorsFrom } from '../lib/validation';
import { useSubmit } from '../lib/useSubmit';

export function AcceptInvitePage(): ReactElement {
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token') ?? '';
	const api = useApi();
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const submit = useSubmit();
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errors, setErrors] = useState<FieldErrors>({});

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const parsed = acceptInviteRequestSchema.safeParse({ token, newPassword });
		const nextErrors = parsed.success ? {} : fieldErrorsFrom(parsed.error.issues);
		if (newPassword !== confirmPassword) {
			nextErrors.confirmPassword =
				'The two passwords do not match. Type the same password again.';
		}
		setErrors(nextErrors);
		if (!parsed.success || nextErrors.confirmPassword) {
			return;
		}
		void submit.run(async () => {
			const response = await api.auth.acceptInvite(parsed.data);
			if (!signIn(response)) {
				submit.setError('This invite is not for the facility admin console.');
				return;
			}
			navigate('/', { replace: true });
		});
	};

	return (
		<main className="ck-auth">
			<div className="ck-auth__card">
				<h1 className="ck-page-title">Set your password</h1>
				{token === '' ? (
					<ErrorBanner message="This invite link is incomplete. Ask your administrator for a new link." />
				) : (
					<form className="ck-form" onSubmit={handleSubmit} noValidate>
						{submit.error ? <ErrorBanner message={submit.error} /> : null}
						{errors.token ? <ErrorBanner message={errors.token} /> : null}
						<TextField
							label="New password"
							type="password"
							autoComplete="new-password"
							help={`Use at least ${PASSWORD_MIN_LENGTH} characters. A short sentence is easy to remember.`}
							value={newPassword}
							onChange={setNewPassword}
							error={errors.newPassword}
						/>
						<TextField
							label="Type the password again"
							type="password"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={setConfirmPassword}
							error={errors.confirmPassword}
						/>
						<Button type="submit" variant="primary" disabled={submit.isSubmitting}>
							Set password and sign in
						</Button>
					</form>
				)}
			</div>
		</main>
	);
}

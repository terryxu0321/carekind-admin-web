// DESIGN.md §7.1 buttons. "primary" is the one submit action of a form; everything else is
// secondary (pill) or utility (compact admin tool button).
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'utility';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
	primary: 'ck-button ck-button--primary',
	secondary: 'ck-button ck-button--secondary',
	utility: 'ck-button ck-button--utility',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
}

export function Button({
	variant = 'secondary',
	type = 'button',
	className,
	...rest
}: ButtonProps): ReactElement {
	const classes = className ? `${VARIANT_CLASS[variant]} ${className}` : VARIANT_CLASS[variant];
	return <button type={type} className={classes} {...rest} />;
}

interface ButtonLinkProps {
	to: string;
	variant?: Exclude<ButtonVariant, 'primary'>;
	children: ReactNode;
}

// Navigation that looks like a button (e.g. "Add resident"); never a submit.
export function ButtonLink({ to, variant = 'secondary', children }: ButtonLinkProps): ReactElement {
	return (
		<Link to={to} className={VARIANT_CLASS[variant]}>
			{children}
		</Link>
	);
}

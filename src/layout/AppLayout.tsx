// DESIGN.md side-nav layout (admin-web): 240px parchment nav, content to the right. Nav items
// the person's role cannot use are hidden; the API still enforces every permission.
import { type ReactElement, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth, useMe } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { canAnywhere } from '../lib/access';

interface NavItem {
	to: string;
	label: string;
	isVisible: boolean;
}

export function AppLayout(): ReactElement {
	const me = useMe();
	const { signOut } = useAuth();
	const [isNavOpen, setIsNavOpen] = useState(false);

	const items: NavItem[] = [
		{ to: '/', label: 'Overview', isVisible: canAnywhere(me, 'view_overview') },
		{ to: '/facilities', label: 'Facilities', isVisible: true },
		{ to: '/staff', label: 'Staff', isVisible: canAnywhere(me, 'manage_staff') },
		{ to: '/residents', label: 'Residents', isVisible: canAnywhere(me, 'manage_residents') },
		{ to: '/audit', label: 'Audit log', isVisible: canAnywhere(me, 'view_audit') },
	];

	return (
		<div className="ck-shell">
			<nav
				className={isNavOpen ? 'ck-sidenav ck-sidenav--open' : 'ck-sidenav'}
				aria-label="Main"
			>
				<div className="ck-sidenav__header">
					<p className="ck-sidenav__org">{me.organisationName}</p>
					<Button
						variant="utility"
						className="ck-sidenav__toggle"
						aria-expanded={isNavOpen}
						onClick={() => setIsNavOpen((open) => !open)}
					>
						Menu
					</Button>
				</div>
				<ul className="ck-sidenav__list">
					{items
						.filter((item) => item.isVisible)
						.map((item) => (
							<li key={item.to}>
								<NavLink
									to={item.to}
									end={item.to === '/'}
									className="ck-sidenav__item"
									onClick={() => setIsNavOpen(false)}
								>
									{item.label}
								</NavLink>
							</li>
						))}
				</ul>
				<div className="ck-sidenav__footer">
					<p className="ck-help">
						Signed in as {me.givenName} {me.familyName}
					</p>
					<Button variant="utility" onClick={signOut}>
						Sign out
					</Button>
				</div>
			</nav>
			<main className="ck-main">
				<Outlet />
			</main>
		</div>
	);
}

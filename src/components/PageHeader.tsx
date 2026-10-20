import type { ReactElement, ReactNode } from 'react';

interface PageHeaderProps {
	title: string;
	description?: string;
	// Navigation or dialog-opening buttons; never a second submit.
	actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps): ReactElement {
	return (
		<header className="ck-page-header">
			<div>
				<h1 className="ck-page-title">{title}</h1>
				{description ? <p className="ck-page-description">{description}</p> : null}
			</div>
			{actions ? <div className="ck-toolbar">{actions}</div> : null}
		</header>
	);
}

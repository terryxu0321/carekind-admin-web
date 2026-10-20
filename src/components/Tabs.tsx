// DESIGN.md tabs: segmented control switching 2–4 views of one page.
import type { ReactElement } from 'react';

export interface TabItem<Key extends string> {
	key: Key;
	label: string;
}

interface TabsProps<Key extends string> {
	label: string;
	tabs: readonly TabItem<Key>[];
	selected: Key;
	onSelect: (key: Key) => void;
}

export function Tabs<Key extends string>({
	label,
	tabs,
	selected,
	onSelect,
}: TabsProps<Key>): ReactElement {
	return (
		<div className="ck-tabs" role="tablist" aria-label={label}>
			{tabs.map((tab) => (
				<button
					key={tab.key}
					type="button"
					role="tab"
					className="ck-tabs__tab"
					aria-selected={tab.key === selected}
					onClick={() => onSelect(tab.key)}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}

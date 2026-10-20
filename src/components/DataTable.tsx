// DESIGN.md data-table: quiet header, 48px rows, horizontal hairlines only, numbers right-aligned
// with tabular figures; scrolls inside its own container on narrow screens.
import type { ReactElement, ReactNode } from 'react';

export interface Column<Row> {
	header: string;
	render: (row: Row) => ReactNode;
	isNumeric?: boolean;
}

interface DataTableProps<Row> {
	caption: string;
	columns: readonly Column<Row>[];
	rows: readonly Row[];
	rowKey: (row: Row) => string;
}

export function DataTable<Row>({
	caption,
	columns,
	rows,
	rowKey,
}: DataTableProps<Row>): ReactElement {
	return (
		<div className="ck-table-wrap" tabIndex={0} role="region" aria-label={caption}>
			<table className="ck-table">
				<caption className="ck-visually-hidden">{caption}</caption>
				<thead>
					<tr>
						{columns.map((column) => (
							<th
								key={column.header}
								scope="col"
								className={column.isNumeric ? 'ck-numeric' : undefined}
							>
								{column.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={rowKey(row)}>
							{columns.map((column) => (
								<td
									key={column.header}
									className={column.isNumeric ? 'ck-numeric' : undefined}
								>
									{column.render(row)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

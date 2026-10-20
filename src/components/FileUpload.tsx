// DESIGN.md file-upload (admin-web): parchment zone with a SOLID border (dashed is reserved for
// AI drafts), accepted format stated, one row per file with remove, errors as icon + text.
import { type ReactElement, useId, useRef } from 'react';
import { Button } from './Button';
import { FieldMessages, describedBy } from './FieldParts';

interface FileUploadProps {
	label: string;
	help: string;
	accept: string;
	file: File | null;
	onChange: (file: File | null) => void;
	isUploading: boolean;
	error?: string;
}

const BYTES_PER_KB = 1024;

function formatSize(bytes: number): string {
	return bytes < BYTES_PER_KB * BYTES_PER_KB
		? `${Math.max(1, Math.round(bytes / BYTES_PER_KB))} KB`
		: `${(bytes / (BYTES_PER_KB * BYTES_PER_KB)).toFixed(1)} MB`;
}

export function FileUpload({
	label,
	help,
	accept,
	file,
	onChange,
	isUploading,
	error,
}: FileUploadProps): ReactElement {
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const clear = (): void => {
		if (inputRef.current) {
			inputRef.current.value = '';
		}
		onChange(null);
	};
	return (
		<div className="ck-field">
			<div className="ck-upload">
				<label htmlFor={id} className="ck-label">
					{label}
				</label>
				<input
					ref={inputRef}
					id={id}
					type="file"
					accept={accept}
					className="ck-upload__input"
					onChange={(event) => onChange(event.target.files?.[0] ?? null)}
					aria-describedby={describedBy(id, help, error)}
				/>
				<FieldMessages id={id} help={help} error={error} />
			</div>
			{file === null ? null : (
				<div className="ck-upload__file">
					<span>{file.name}</span>
					<span className="ck-help">{formatSize(file.size)}</span>
					{isUploading ? (
						<span className="ck-loading" role="status">
							<span className="ck-spinner" aria-hidden="true" />
							Uploading…
						</span>
					) : (
						<Button variant="utility" onClick={clear}>
							Remove file
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

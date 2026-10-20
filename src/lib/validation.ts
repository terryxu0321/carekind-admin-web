// Turns zod issues from the shared schemas into one plain-English message per field.
export type FieldErrors = Partial<Record<string, string>>;

export interface ValidationIssue {
	code: string;
	path: readonly PropertyKey[];
	message: string;
	minimum?: unknown;
	format?: unknown;
}

function friendlyMessage(issue: ValidationIssue): string {
	if (issue.code === 'too_small' && issue.minimum === 1) {
		return 'This field is required.';
	}
	if (issue.code === 'too_small' && typeof issue.minimum === 'number') {
		return `Use at least ${issue.minimum} characters.`;
	}
	if (issue.code === 'invalid_format' && issue.format === 'email') {
		return 'Enter an email address, for example name@example.com.';
	}
	if (issue.code === 'invalid_type' || issue.code === 'invalid_value') {
		return 'Choose or enter a value.';
	}
	return issue.message;
}

export function fieldErrorsFrom(issues: readonly ValidationIssue[]): FieldErrors {
	const errors: FieldErrors = {};
	for (const issue of issues) {
		const field = issue.path.length > 0 ? String(issue.path[0]) : 'form';
		errors[field] ??= friendlyMessage(issue);
	}
	return errors;
}

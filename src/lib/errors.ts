// Plain-English error text for banners and inline errors. Server messages carry no health
// information (tech design §4), so they can be shown as they are.
import { ApiError } from '@carekind/shared';

export function errorMessage(error: unknown): string {
	if (!(error instanceof ApiError)) {
		return 'Something went wrong. Try again.';
	}
	switch (error.code) {
		case 'network_error':
			return 'Could not reach the CareKind server. Check your connection and try again.';
		case 'unexpected_response':
			return 'The server sent an unexpected response. Try again, or contact CareKind support.';
		case 'forbidden':
			return 'Your role does not allow this action.';
		case 'not_found':
			return 'This item was not found. It may have been removed.';
		default:
			return error.message;
	}
}

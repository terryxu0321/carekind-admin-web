import {
	type Facility,
	type GoLiveItem,
	type GoLiveStatus,
	NSW_STAFF_NOTICE_DAYS,
	checkGoLiveItemUpdate,
	goLiveItemUpdateRequestSchema,
} from '@carekind/shared';
import { type ReactElement, useState } from 'react';
import { useApi } from '../../auth/AuthContext';
import { RadioGroup } from '../../components/ChoiceFields';
import { DateTimeField } from '../../components/DateTimeField';
import { FormDialog } from '../../components/FormDialog';
import { useToast } from '../../components/Toast';
import { GO_LIVE_ITEM_LABELS } from '../../lib/labels';
import { type FieldErrors, fieldErrorsFrom } from '../../lib/validation';
import { useSubmit } from '../../lib/useSubmit';

const COMPLETION_OPTIONS = [
	{ value: 'completed', label: 'Completed' },
	{ value: 'not_completed', label: 'Not completed' },
];

interface GoLiveItemDialogProps {
	facility: Facility;
	item: GoLiveItem;
	onClose: () => void;
	onSaved: (status: GoLiveStatus) => void;
}

export function GoLiveItemDialog({
	facility,
	item,
	onClose,
	onSaved,
}: GoLiveItemDialogProps): ReactElement {
	const api = useApi();
	const showToast = useToast();
	const submit = useSubmit();
	const isNotice = item.key === 'staff_notice_sent';
	const [completion, setCompletion] = useState(
		item.completedAt === null ? 'not_completed' : 'completed',
	);
	const [noticeSentOn, setNoticeSentOn] = useState(item.noticeSentOn ?? '');
	const [errors, setErrors] = useState<FieldErrors>({});

	const save = (): void => {
		const isCompleted = completion === 'completed';
		const body = {
			completed: isCompleted,
			...(isNotice
				? { noticeSentOn: isCompleted && noticeSentOn !== '' ? noticeSentOn : null }
				: {}),
		};
		const parsed = goLiveItemUpdateRequestSchema.safeParse(body);
		if (!parsed.success) {
			setErrors(fieldErrorsFrom(parsed.error.issues));
			return;
		}
		const rule = checkGoLiveItemUpdate(item.key, parsed.data);
		if (!rule.ok) {
			setErrors({ noticeSentOn: rule.reason });
			return;
		}
		setErrors({});
		void submit.run(async () => {
			onSaved(await api.org.updateGoLiveItem(facility.id, item.key, rule.value));
			showToast('Checklist item saved');
		});
	};

	return (
		<FormDialog
			title={GO_LIVE_ITEM_LABELS[item.key]}
			submitLabel="Save checklist item"
			onSubmit={save}
			onClose={onClose}
			isSubmitting={submit.isSubmitting}
			error={submit.error}
		>
			<RadioGroup
				legend="Status"
				options={COMPLETION_OPTIONS}
				value={completion}
				onChange={setCompletion}
				error={errors.completed}
			/>
			{isNotice && completion === 'completed' ? (
				<DateTimeField
					label="Date written notice was given"
					kind="date"
					value={noticeSentOn}
					onChange={setNoticeSentOn}
					help={
						facility.state === 'NSW'
							? `NSW: recording can start ${NSW_STAFF_NOTICE_DAYS} days after this date.`
							: 'Recorded for your records.'
					}
					error={errors.noticeSentOn}
				/>
			) : null}
		</FormDialog>
	);
}

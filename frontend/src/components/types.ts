import type { BehaviorSubject } from 'rxjs'

export type MessageEntry = {
	id: string
	isSender?: boolean
	/** When request fails */
	error?: string
	/** Subject available for new messages that is being streamed */
	text: string | BehaviorSubject<string>
	timestamp: number
}

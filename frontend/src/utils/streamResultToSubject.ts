import { isFn } from '@superutils/core'
import { BehaviorSubject } from 'rxjs'

/**
 * Returns a callback that reads text stream from `fetch` `Response` into the provided RxJS subject
 */
export const streamResultToSubject =
	(
		subject: BehaviorSubject<string> | (() => BehaviorSubject<string>),
		onDone?: (subject: BehaviorSubject<string>, error?: Error) => void,
		onUpdate?: (subject: BehaviorSubject<string>) => void,
	) =>
	(response: Response) => {
		const _subject = isFn(subject) ? subject() : subject
		if (!response.body) {
			_subject.complete()
			onDone?.(_subject, new Error('Empty response body received'))
			return
		}
		const reader = response.body.getReader()
		const decoder = new TextDecoder('utf-8')

		const readStream = async () => {
			let done = false
			let text = ''
			do {
				const next = await reader.read()
				done = next.done
				const chunk = decoder.decode(next.value, { stream: true })
				text += chunk
				_subject.next(text)
				onUpdate?.(_subject)
			} while (!done)
		}

		readStream()
			.then(
				() => onDone?.(_subject),
				(err: Error) => onDone?.(_subject, err),
			)
			.finally(() => {
				_subject.complete()
			})
	}

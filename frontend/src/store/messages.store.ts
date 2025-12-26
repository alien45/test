import { isObservable } from 'rxjs'
import type { MessageEntry } from '../components/types'
import StoreService from './StoreService'

export class MessagesStore<
	T extends Map<string, MessageEntry>,
> extends StoreService<T> {
	constructor(...args: ConstructorParameters<typeof StoreService<T>>) {
		super(...args)
	}

	delete(id: string) {
		this.value.delete(id)
		this.next(new Map(this.value) as T)
	}

	save(message?: MessageEntry) {
		if (message) this.value.set(message.id, message)
		// trigger update state and save to storage
		this.next(new Map(this.value) as T)
	}
}
const messagesStore = new MessagesStore<Map<string, MessageEntry>>(new Map(), {
	autoSave: true,
	storageKey: 'llm-messages',
	parse: str =>
		str ? new Map<string, MessageEntry>(JSON.parse(str)) : undefined,
	stringify: messages =>
		JSON.stringify(
			[...messages.entries()].map(([id, m]) => [
				id,
				{
					...m,
					// make sure there's no observable before stringifying
					text: isObservable(m.text) ? m.text.value : m.text,
				},
			]),
		),
})
export default messagesStore

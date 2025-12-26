import type { MessageEntry } from './types'
import Message from './Message'
import { isObservable, Subscription, type BehaviorSubject } from 'rxjs'
import { useCallback, useEffect, useState } from 'react'
import messagesStore from '../store/messages.store'

export default function MessageList(props: {
	emptyMessage?: MessageEntry
	messages:
		| Map<string, MessageEntry>
		| BehaviorSubject<Map<string, MessageEntry>>
}) {
	const { emptyMessage, messages: _msgs } = props
	const [messages, setMessages] = useState(new Map<string, MessageEntry>())
	const handleDelete = useCallback((id: string) => {
		messagesStore.delete(id)
	}, [])

	useEffect(() => {
		let mounted = true
		let sub: Subscription | undefined
		if (isObservable(_msgs)) {
			sub = _msgs.subscribe(msgs => mounted && setMessages(msgs))
		} else if (_msgs) {
			setTimeout(() => setMessages(_msgs))
		}

		return () => {
			mounted = false
			if (sub) sub.unsubscribe()
		}
	}, [_msgs])

	return (
		<div>
			{!messages?.size && emptyMessage ? (
				<Message
					key='empty'
					{...emptyMessage}
				/>
			) : (
				[...messages.values()].map(message => (
					<Message
						key={message.id}
						onDelete={handleDelete}
						{...message}
					/>
				))
			)}
		</div>
	)
}

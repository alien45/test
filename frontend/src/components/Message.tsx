import { useEffect, useState } from 'react'
import type { MessageEntry } from './types'
import { isStr } from '@superutils/core'
import { isObservable } from 'rxjs'

export type MessageProps = MessageEntry & { onDelete?: (id: string) => void }
export default function Message(message: MessageProps) {
	const { error, id, isSender, onDelete, text: textOrRx } = message
	const [[text, closed], setText] = useState(
		isObservable(textOrRx)
			? [textOrRx.value, textOrRx.closed]
			: [textOrRx, true],
	)

	useEffect(() => {
		let mounted = true
		const sub =
			!isStr(textOrRx) &&
			textOrRx.subscribe(
				text => mounted && setText([text, textOrRx.closed]),
			)

		return () => {
			mounted = false
			if (sub) sub.unsubscribe()
		}
	}, [textOrRx])

	return (
		<div
			className={`flex w-full mb-2 ${
				isSender ? 'justify-end' : 'justify-start'
			}`}
		>
			<div
				className={`group relative max-w-[80%] rounded-2xl px-4 py-2 shadow-sm whitespace-pre-wrap ${
					isSender
						? 'bg-blue-500 text-white rounded-br-none'
						: 'bg-gray-200 text-gray-900 rounded-bl-none'
				}`}
			>
				{closed && (
					<button
						className='absolute cursor-pointer -top-2 -right-2 opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs shadow-sm transition-opacity duration-200'
						onClick={() => onDelete?.(id)}
						title='Remove messge?'
					>
						x
					</button>
				)}
				{text ?? error}
			</div>
		</div>
	)
}

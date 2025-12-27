import fetch, { FetchAs } from '@superutils/fetch'
import { isStr } from '@superutils/core'
import { useCallback, useEffect, useState } from 'react'
import { BehaviorSubject } from 'rxjs'
import messagesStore from '../store/messages.store'
import { scrollToEl, streamResultToSubject } from '../utils'
import MessageList from './MessageList'
import type { MessageEntry } from './types'

/** Read the API base URL from the .env file */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? location.origin
const streamUrl = `${apiBaseUrl}/stream`
const chatEl = '#chat-container > div'

/**
 * A debounced fetch client with POST method that will read the stream response
 * and add & update the incoming message entry automatically
 */
const sendMessage = fetch.post.deferred(
	{ delayMs: 300 }, // debounce duration
	streamUrl,
	undefined, // data to be provided on-submit
	{
		as: FetchAs.response,
		retry: 3, // max retry 3 times, total max 4 attempts
		retryDelay: 300, // 300ms
		retryBackOff: 'exponential',
		retryDelayJitter: true,
		retryDelayJitterMax: 100, //100ms
	},
)

export default function Chat() {
	const [query, setQuery] = useState('')
	const [{ loading = false }, setState] = useState<{ loading?: boolean }>({})
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setQuery(event.target.value)
		},
		[],
	)
	const handleSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			setState({ loading: true })

			// add the outgoing message
			const ts_sent = new Date()
			const msgSent: MessageEntry = {
				id: ts_sent.getTime().toString(),
				isSender: true,
				text: query,
				timestamp: ts_sent.getTime(),
			}
			messagesStore.value.set(msgSent.id, msgSent)
			messagesStore.next(new Map(messagesStore.value))
			const cleanup = () => {
				// cleanups
				setState({ loading: false })
				setQuery('')
			}
			sendMessage(
				{ query, duration: 5 },
				{
					interceptors: {
						error: [
							(error, _url, options) => {
								// request failed > attach error text to the message entry
								// extract sent message from options
								const { body } = options
								const msg = (
									isStr(body) ? JSON.parse(body) : body
								) as MessageEntry
								if (!msg) return console.error(error)

								msg.error = `Failed to send messge! \nError: ${error.message}`
								// // trigger update state and save to storage
								messagesStore.save(msg)
								cleanup()
							},
						],
						response: [
							// once response is received read the streamed texts and store it the rxStread subject
							streamResultToSubject(
								() => {
									// add the incoming streaming message
									const rxStream = new BehaviorSubject(
										'Waiting for response...', // will be overriden
									)
									const now = new Date()
									const msg: MessageEntry = {
										id: now.getTime().toString(),
										text: rxStream,
										timestamp: now.getTime(),
									}

									// add the incoming streaming message
									messagesStore.save(msg)
									scrollToEl(chatEl)
									// return the subject to be auto-updated by reading the stream response
									return rxStream
								},
								() => {
									// stream completed => trigger save to localStorage
									messagesStore.saveToStorage()
									cleanup()
								},
								() => scrollToEl(chatEl), // scroll on update
							),
						],
					},
				},
			)
				// ignore error as the error interceptor will take care of it
				.catch(() => cleanup())

			scrollToEl(chatEl)
		},
		[query],
	)

	useEffect(() => {
		setTimeout(() => scrollToEl(chatEl), 100)
	}, [])

	return (
		<div
			id='chat-container'
			className='flex items-center justify-center h-screen'
		>
			<div className='flex flex-col w-full max-w-[900px] h-[99vh] border border-gray-600 rounded-xl shadow-lg p-4 overflow-x-hidden overflow-y-auto'>
				<div className='message-list flex-1 mb-4'>
					<MessageList
						emptyMessage={
							{
								id: '',
								text: 'Welcome to LLM Simulator! \nYou can start by saying "Hello!"',
							} as MessageEntry
						}
						messages={messagesStore}
					/>
				</div>
				<div>
					<div className='w-full'>
						<form
							onSubmit={handleSubmit}
							className='flex gap-0 w-full'
						>
							<input
								{...{
									className:
										'flex-1 border border-blue-400 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
									disabled: loading,
									onChange: handleChange,
									placeholder: 'Enter your query here...',
									value: query,
									type: 'search',
								}}
							/>
							<button
								className='bg-blue-500 text-white px-6 py-2 rounded-r hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
								disabled={loading}
							>
								Send
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

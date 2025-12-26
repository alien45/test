import { fallbackIfFails, isBool, isFn } from '@superutils/core'
import { BehaviorSubject, Subscription } from 'rxjs'

export type StoreOptions<T> = {
	/** If `true` and `storageKey` is provided, value will automatically saved to localStorage */
	autoSave: boolean
	/**
	 * Function to parse string to value type `T`.
	 * If `undefined` is returned:
	 * 1. In the constructor. the default value will be used
	 * 2. Otherwise, value will be ignored
	 */
	parse?: (value: string) => T | undefined
	/** convert value to string for storage. If not provided, `JSON.stringify` will be used */
	stringify?: (value: T) => string
	/** localStorage key */
	storageKey: string
}
export default class StoreService<T> extends BehaviorSubject<T> {
	private _options: StoreOptions<T> = {
		autoSave: false,
		storageKey: '',
		stringify: undefined,
	}
	private _subscription: Subscription | null = null

	constructor(value: T, options?: StoreOptions<T>) {
		const { autoSave, parse, storageKey } = options || {}
		if (storageKey) {
			value = StoreService.readFromStorage(storageKey, parse) ?? value
		}
		super(value)

		if (options) this._options = options
		if (autoSave) this.autoSave(autoSave)
	}

	/**
	 *
	 * @param {Boolean|undefined} enable (optional) whether to enable to disable auto saving to localStorage.
	 * If `undefined`, will simply return current auto-save status
	 *
	 * Default: `undefined`
	 * @returns {Boolean} auto-save status
	 */
	autoSave(enable?: boolean): boolean {
		const { autoSave, storageKey } = this._options
		if (!isBool(enable) || enable === autoSave) return autoSave

		// disable auto-save or subject is completed/closed
		if (!enable || !storageKey || this.closed) {
			this._subscription?.unsubscribe?.()
			this._options.autoSave = false
			this._subscription = null
			return false
		}

		// enable auto save
		this._options.autoSave = true
		this._subscription = this.subscribe(this.saveToStorage)
		return true
	}

	static readFromStorage<T>(
		storageKey: string,
		parse?: (value: string) => T,
	): T | undefined {
		const str = localStorage.getItem(storageKey)
		return str === null
			? undefined
			: fallbackIfFails(parse ?? JSON.parse, [str], undefined)
	}

	/** save current value to storage */
	saveToStorage(value = this.value) {
		const { stringify, storageKey } = this._options

		if (!storageKey) return
		const str = isFn(stringify) ? stringify(value) : JSON.stringify(value)
		localStorage.setItem(storageKey, str)
	}

	get storageKey() {
		return this._options.storageKey
	}

	updateFromStorage() {
		const { parse, storageKey } = this._options

		const value = StoreService.readFromStorage(storageKey, parse)
		if (value === undefined) return

		this.next(value)
		return value
	}
}

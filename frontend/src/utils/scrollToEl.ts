export const scrollToEl = (selector: string) => {
	const el = document.querySelector(selector)
	if (!el) return false

	el.scrollTo({
		top: el.scrollHeight,
		behavior: 'smooth',
	})
	return true
}

import '@testing-library/jest-dom'
import { interceptActWarnings } from './test-utils/act-helpers'

// Ensure TextEncoder/TextDecoder exist before loading undici
// @ts-ignore
if (typeof global.TextEncoder === 'undefined' || typeof global.TextDecoder === 'undefined') {
	const util = require('util') as typeof import('util')
	// @ts-ignore
	if (typeof global.TextEncoder === 'undefined') global.TextEncoder = util.TextEncoder as any
	// @ts-ignore
	if (typeof global.TextDecoder === 'undefined') global.TextDecoder = util.TextDecoder as any
}

// Polyfill Web Streams API if missing (jsdom doesn't provide these)
// @ts-ignore
if (
	typeof global.ReadableStream === 'undefined' ||
	typeof global.WritableStream === 'undefined' ||
	typeof global.TransformStream === 'undefined'
) {
	const streamWeb = require('stream/web') as typeof import('stream/web')
	// @ts-ignore
	if (typeof global.ReadableStream === 'undefined') global.ReadableStream = streamWeb.ReadableStream as any
	// @ts-ignore
	if (typeof global.WritableStream === 'undefined') global.WritableStream = streamWeb.WritableStream as any
	// @ts-ignore
	if (typeof global.TransformStream === 'undefined') global.TransformStream = streamWeb.TransformStream as any
}

// Polyfill Fetch API objects for Node test environment
// Use require to ensure polyfills above are applied first
const undici = require('undici') as typeof import('undici')
// @ts-ignore
if (typeof global.fetch === 'undefined') {
	// @ts-ignore
	global.fetch = undici.fetch as any
}
// @ts-ignore
if (typeof global.Request === 'undefined') {
	// @ts-ignore
	global.Request = undici.Request as any
}
// @ts-ignore
if (typeof global.Response === 'undefined') {
	// @ts-ignore
	global.Response = undici.Response as any
}
// @ts-ignore
if (typeof global.Headers === 'undefined') {
	// @ts-ignore
	global.Headers = undici.Headers as any
}

// Enforce proper act() usage in tests; throw immediately on first warning
interceptActWarnings({ mode: 'throw' })

// Provide minimal App Router hooks globally to avoid invalid hook calls in jsdom
// Individual tests can override these with jest.mock if they need specific behavior.
jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
	useSearchParams: () => new URLSearchParams(''),
	usePathname: () => '/',
}))

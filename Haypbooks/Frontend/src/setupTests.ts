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
const TEST_BASE_URL = 'http://localhost'
const originalFetch = typeof global.fetch === 'undefined' ? undici.fetch : global.fetch
const normalizeFetchInput = (input: RequestInfo) => {
	if (typeof input === 'string' && input.startsWith('/')) {
		return new URL(input, TEST_BASE_URL).toString()
	}
	if (input instanceof URL && input.pathname.startsWith('/')) {
		return new URL(input.pathname + input.search + input.hash, TEST_BASE_URL)
	}
	if (typeof input === 'object' && input !== null && 'url' in input && typeof (input as any).url === 'string' && (input as any).url.startsWith('/')) {
		const request = input as Request
		return new undici.Request(new URL(request.url, TEST_BASE_URL).toString(), request)
	}
	return input
}
const normalizedFetch = (input: RequestInfo, init?: RequestInit) => {
	return originalFetch(normalizeFetchInput(input) as any, init)
}
// @ts-ignore
global.fetch = normalizedFetch as any
// @ts-ignore
globalThis.fetch = normalizedFetch as any
if (typeof window !== 'undefined') {
	// @ts-ignore
	window.fetch = normalizedFetch as any
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

// Patch `window.location` navigation methods when available so client code can
// call assign/replace/reload without failing in jsdom. Directly overriding the
// non-configurable jsdom location object is not reliable, so only patch methods.
if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
	const locationObj: any = window.location as any
	if (typeof locationObj.assign !== 'function') {
		locationObj.assign = jest.fn()
	}
	if (typeof locationObj.replace !== 'function') {
		locationObj.replace = jest.fn()
	}
	if (typeof locationObj.reload !== 'function') {
		locationObj.reload = jest.fn()
	}
}

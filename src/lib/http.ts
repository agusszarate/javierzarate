export type HttpError = {
  status: number
  message: string
  details?: unknown
}

export async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    let details: unknown
    try { details = await res.json() } catch { /* noop */ }
    const err: HttpError = { status: res.status, message: res.statusText, details }
    throw err
  }
  return (await res.json()) as T
}

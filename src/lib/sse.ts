let es: EventSource | null = null;

export function getSSE(url: string) {
  if (es && es.readyState !== EventSource.CLOSED) return es;
  es = new EventSource(url, { withCredentials: true });
  return es;
}

export function closeSSE() {
  if (es) { es.close(); es = null; }
}

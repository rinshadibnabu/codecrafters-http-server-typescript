export function buildResponse(
  status: { code: number; text: string },
  headers: Record<string, string>,
  body: string | Uint8Array,
): Uint8Array | string {
  const statusLine = `HTTP/1.1 ${status.code} ${status.text}`;
  if (!body && Object.keys(headers).length === 0) {
    return statusLine;
  }

  const headerLines = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\r\n");
  const head = `${statusLine}\r\n${headerLines}\r\n\r\n`;

  const headBytes = new TextEncoder().encode(head);

  if (typeof body === "string") {
    const bodyBytes = new TextEncoder().encode(body);
    const full = new Uint8Array(headBytes.length + bodyBytes.length);
    full.set(headBytes);
    full.set(bodyBytes, headBytes.length);
    return full;
  } else {
    const full = new Uint8Array(headBytes.length + body.length);
    full.set(headBytes);
    full.set(body, headBytes.length);
    return full;
  }
}

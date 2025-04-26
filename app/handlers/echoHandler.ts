import type { RequestType } from "../requestParser";
import { buildResponse } from "../responseBuilder";
import { Socket } from "node:net";
export function echoHandler(req: RequestType, socket: Socket) {
  let str: string | Uint8Array = req.path.split("/echo/")[1];

  const headers: Record<string, string> = {
    "Content-Type": "text/plain",
  };

  if (req.headers["Accept-Encoding"]?.includes("gzip")) {
    str = Bun.gzipSync(str);
    headers["Content-Encoding"] = "gzip";
  }

  headers["Content-Length"] = str.length.toString();
  socket.write(
    buildResponse({ code: 200, text: "OK" }, headers, str),
  );
}

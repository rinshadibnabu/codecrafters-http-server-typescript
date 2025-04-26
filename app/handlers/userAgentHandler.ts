import type { RequestType } from "../requestParser";
import { buildResponse } from "../responseBuilder";
import { Socket } from "node:net";
export function userAgentHandler(req: RequestType, socket: Socket) {
  const userAgent = req.headers["User-Agent"] || "";

  socket.write(buildResponse({ code: 200, text: "OK" }, {
    "Content-Type": "text/plain",
    "Content-Length": userAgent.length.toString(),
    "Connection": "close",
  }, userAgent));
}

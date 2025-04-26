import { buildResponse } from "../responseBuilder";

export function userAgentHandler(req, socket) {
  const userAgent = req.headers["User-Agent"] || "";

  socket.write(buildResponse({ code: 200, text: "OK" }, {
    "Content-Type": "text/plain",
    "Content-Length": userAgent.length.toString(),
    "Connection": "close",
  }, userAgent));
}

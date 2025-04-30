import { echoHandler } from "../handlers/echoHandler";
import { fileHandler } from "../handlers/fileHandler";
import { userAgentHandler } from "../handlers/userAgentHandler";
import { buildResponse } from "../responseBuilder";
import type { RequestType } from "../requestParser";
import { Socket } from "node:net";

export async function router(req: RequestType, socket: Socket) {
  if (req.headers["Connection"] == "close") {
    socket.end();
  }

  if (req.path === "/") {
    socket.write(
      buildResponse({ code: 200, text: "OK" }, { "Connection": "close" }, ""),
    );
  } else if (req.path.startsWith("/files/")) await fileHandler(req, socket);
  else if (req.path.startsWith("/user-agent")) userAgentHandler(req, socket);
  else if (req.path.startsWith("/echo/")) echoHandler(req, socket);
  else socket.write(buildResponse({ code: 404, text: "Not Found" }, {}, ""));
  if (req.headers["Connection"] == "close") {
    socket.end();
  }
}

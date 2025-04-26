import type { BunFile, Socket } from "bun";
import * as net from "node:net";
console.log("Logs from your program will appear here!");

import { fileHandler } from "./handlers/fileHandler"; ()
import { pasrseReq } from "./requestParser";
import { buildResponse } from "./responseBuilder";
import { userAgentHandler } from "./handlers/userAgentHandler";
import { echoHandler } from "./handlers/echoHandler";

const server = net.createServer((socket): void => {
  socket.on("data", async (data: Buffer): Promise<void> => {
    const rawData = data.toString();
    const req = pasrseReq(rawData);

    if (req.path === "/") socket.write(
      buildResponse({ code: 200, text: "OK" }, { "Connection": "close" }, ""),
    );

    else if (req.path.startsWith("/files/")) await fileHandler(req, socket);
    else if (req.path.startsWith("/user-agent")) userAgentHandler(req, socket)
    else if (req.path.startsWith("/echo/")) echoHandler(req, socket)
    else socket.write(buildResponse({ code: 404, text: "Not Found" }, {}, ""));
    if (req.headers["Connection"] == "close") {
      socket.end();
    }
  })
  socket.on("close", () => {
    console.log("client got disconnected");
    socket.end();
  });
  socket.on("error", (err) => {
    console.log(`socket error ${err}`);
  });
});

server.listen(4221, "localhost");

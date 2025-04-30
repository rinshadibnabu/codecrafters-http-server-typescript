import * as net from "node:net";
console.log("Logs from your program will appear here!");

import { pasrseReq } from "./requestParser";
import { router } from "./router";

const server = net.createServer((socket: net.Socket): void => {
  socket.on("data", async (data: Buffer): Promise<void> => {
    const rawData = data.toString();
    const req = pasrseReq(rawData);
    router(req, socket);
  });

  socket.on("close", () => {
    console.log("client got disconnected");
    socket.end();
  });
  socket.on("error", (err) => {
    console.log(`socket error ${err}`);
  });
});

server.listen(4221, "localhost");

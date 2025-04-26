import type { BunFile, Socket } from "bun";
import * as net from "node:net";
import path from "node:path";
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

import { pasrseReq } from "./requestParser";
import { buildResponse } from "./responseBuilder";
const server = net.createServer((socket): void => {
  socket.on("data", async (data: Buffer): Promise<void> => {
    const rawData = data.toString();
    const req = pasrseReq(rawData);

    if (req.path === "/") {
      socket.write(
        buildResponse({ code: 200, text: "OK" }, { "Connection": "close" }, ""),
      );
    } else if (req.path.startsWith("/files/")) {
      const filesBasePath = "/tmp/data/codecrafters.io/http-server-tester";

      const fileName = req.path.split("/files/")[1];
      console.log(fileName);
      const filePath = path.join(filesBasePath, fileName);

      if (req.method == "GET") {
        const file = Bun.file(filePath);

        if (await file.exists()) {
          const data = await file.text();

          socket.write(
            buildResponse({ code: 200, text: "OK" }, {
              "Content-Type": "application/octet-stream",
              "Connection": "close",
              "Content-Length": file.size.toString(),
            }, data),
          );
        } else {
          socket.write(
            buildResponse({ code: 404, text: "Not Found" }, {}, ""),
          );
        }
      }

      if (req.method === "POST") {
        try {
          await Bun.write(filePath, req.body);
          socket.write(
            buildResponse({ code: 201, text: "Created" }, {
              "Connection": "close",
            }, ""),
          );
          return;
        } catch (e) {
          socket.write(
            buildResponse({ code: 500, text: "Server problem" }, {}, ""),
          );
          return;
        }
      }
    } else if (req.path.startsWith("/user-agent")) {
      const userAgent = req.headers["User-Agent"] || "";

      socket.write(buildResponse({ code: 200, text: "OK" }, {
        "Content-Type": "text/plain",
        "Content-Length": userAgent.length.toString(),
        "Connection": "close",
      }, userAgent));
    } else if (req.path.startsWith("/echo/")) {
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
    } else {
      socket.write(buildResponse({ code: 404, text: "Not Found" }, {}, ""));
    }
    if (req.headers["Connection"] == "close") {
      socket.end();
    }
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

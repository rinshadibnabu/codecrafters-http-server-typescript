import type { BunFile } from "bun";
import * as net from "node:net";
import path from "node:path";
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const pasrseReq = (rawData: string) => {
  const lines = rawData.split("\r\n");

  const requestline = rawData.split("\r\n")[0].split(" ");
  const path = requestline[1];
  const method = requestline[0];

  const headers: { [key: string]: string } = {};

  let i;
  for (i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() == "") break;
    const indexOfColon = line.indexOf(": ");
    if (indexOfColon == -1) continue;
    const name = line.substring(0, indexOfColon);

    const value = line.substring(indexOfColon + 2);
    headers[name] = value;
  }

  const body = lines.slice(i + 1).join("");
  return { method, path, headers, body };
};

function buildResponse(
  status: { code: number; text: string },
  headers: Record<string, string>,
  body: string | Uint8Array,
): Uint8Array {
  const statusLine = `HTTP/1.1 ${status.code} ${status.text}`;

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

const server = net.createServer((socket) => {
  socket.on("data", async (data) => {
    const rawData = data.toString();
    const req = pasrseReq(rawData);

    if (req.path === "/") {
      socket.write(buildResponse({ code: 200, text: "OK" }, {}, ""));
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

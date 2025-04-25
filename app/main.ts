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
  body: string,
): string {
  const statusLine = `HTTP/1.1 ${status.code} ${status.text}`;
  const headerStrings = Object.entries(headers).map(([key, value]) =>
    `${key}: ${value}`
  );
  return `${statusLine}\r\n${headerStrings.join("\r\n")}\r\n\r\n${body}`;
}

// Uncomment this to pass the first stage

const server = net.createServer((socket) => {
  socket.on("data", async (data) => {
    const file = Bun.file("/tmp/foo");

    const rawData = data.toString();
    const req = pasrseReq(rawData);
    if (req.path === "/") {
      socket.write(buildResponse({ code: 200, text: "OK" }, {}, ""));
      return;
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
          socket.write(buildResponse({ code: 201, text: "Created" }, {}, ""));
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
      }, userAgent));
    } else if (req.path.startsWith("/echo/")) {
      const str = req.path.split("/echo/")[1];
      const headers: Record<string, string> = {
        "Content-Type": "text/plain",
        "Content-Length": str.length.toString(),
      };

      const encodingArry = req.headers["Accept-Encoding"].split(",");
      console.log(encodingArry);
      for (let i = 0; i < encodingArry.length; i++) {
        if (encodingArry[i].trim() === "gzip") {
          headers["Content-Encoding"] = "gzip";
        }
      }

      socket.write(buildResponse({ code: 200, text: "OK" }, headers, str));
    } else {
      socket.write(buildResponse({ code: 404, text: "Not Found" }, {}, ""));
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

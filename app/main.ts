import type { BunFile } from "bun";
import * as net from "node:net";
import path from "node:path/win32";

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
  const parsedReq = {
    Path: path,
    Method: method,
    Headers: headers,
    Body: body,
  };
  return parsedReq;
};

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", async (data) => {
    const file = Bun.file("/tmp/foo");

    const rawData = data.toString();
    const parsedReq = pasrseReq(rawData);
    if (parsedReq.Path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
      return;
    } else if (
      parsedReq.Path.startsWith("/files/") && parsedReq.Method === "GET"
    ) {
      const fileName = parsedReq.Path.substring(7);
      const file = Bun.file(
        `/tmp/data/codecrafters.io/http-server-tester/${fileName}`,
      );
      const isFileExist = await file.exists();
      if (!isFileExist) {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }

      const data = await file.text();
      const size = file.size;

      const response = [
        "HTTP/1.1 200 OK",
        "Content-Type: application/octet-stream",
        `Content-Length: ${size}`,
        "",
        data,
      ].join("\r\n");
      socket.write(response);
    } else if (parsedReq.Path.startsWith("/user-agent")) {
      const response = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${parsedReq.Headers["User-Agent"].length}`,
        "",
        parsedReq.Headers["User-Agent"],
      ].join("\r\n");
      socket.write(response);
    } else if (parsedReq.Path.startsWith("/echo/")) {
      const str = parsedReq.Path.substring(6);
      const response = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Encoding: ${parsedReq.Headers["Accept-Encoding"]}`,
        "",
        str,
      ].join("\r\n");
      socket.write(response);
    } else if (
      parsedReq.Path.startsWith("/files/") && parsedReq.Method === "POST"
    ) {
      console.log(parsedReq.Body);
      const fileName = parsedReq.Path.substring(7);
      try {
        const isSuccesfull = await Bun.write(
          `/ tmp / data / codecrafters.io / http - server - tester / ${fileName}`,
          parsedReq.Body,
        );
      } catch (e) {
        console.log(e);
        socket.write("HTTP/1.1 400 failed\r\n\r\n");
      }

      socket.write("HTTP/1.1 201 Created\r\n\r\n");
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
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

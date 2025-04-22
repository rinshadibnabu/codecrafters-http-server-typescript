import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const rawData = data.toString();
    const lines = rawData.split("\r\n");
    const requestline = rawData.split("\r\n")[0];
    const headers: { [key: string]: string } = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "") break;
      const colonIndex = line.indexOf(": ");
      if (colonIndex === -1) continue;

      const name = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 2);
      headers[name] = value;
    }
    const path = requestline.split(" ")[1];
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith("/echo/")) {
      const str = path.substring(6);
      const response = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${str.length}`,
        "",
        str,
      ].join("\r\n");
      socket.write(response);
    } else if (path === "/user-agent") {
      console.log(headers["User-Agent"].length);
      const response = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${headers["User-Agent"].length}`,
        "",
        headers["User-Agent"],
      ].join("\r\n");

      socket.write(response);
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

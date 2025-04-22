import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const rawData = data.toString();
    const requestline = rawData.split("\r\n")[0];
    const headers = {
      Host: rawData.split("\r\n")[1],
      Accept: rawData.split("\r\n")[2],
      UserAgent: rawData.split("\r\n")[3],
    };

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
      const response = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${headers.UserAgent.length}`,
        "",
        headers.UserAgent,
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

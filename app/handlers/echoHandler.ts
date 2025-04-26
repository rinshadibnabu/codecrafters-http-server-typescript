import { buildResponse } from "../responseBuilder";


export function echoHandler(req, socket) {
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

}

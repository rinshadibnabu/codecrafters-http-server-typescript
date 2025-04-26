import { buildResponse } from "../responseBuilder";
import { Socket } from "node:net";
import path from "node:path";
import type { RequestType } from "../requestParser";

export async function fileHandler(req: RequestType, socket: Socket) {
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
}

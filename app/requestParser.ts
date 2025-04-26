type Method = "GET" | "POST";
export type RequestType = {
  method: Method;
  path: string;
  headers: Record<string, string>;
  body: string;
};

export const pasrseReq = (rawData: string): RequestType => {
  const lines = rawData.split("\r\n");

  const requestline = rawData.split("\r\n")[0].split(" ");
  const path = requestline[1];
  const rawMethod = requestline[0];
  if (rawMethod !== "GET" && rawMethod !== "POST") {
    throw new Error("Unsupported method");
  }

  const method: Method = rawMethod;
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

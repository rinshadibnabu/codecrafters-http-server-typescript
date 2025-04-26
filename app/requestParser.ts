export const pasrseReq = (rawData: string) => {
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

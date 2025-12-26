import fs from "fs";
import path from "path";
import axios from "axios";

export const downloadFile = async (fileUrl: string, filename: string) => {
  const filePath = path.join("downloads", filename);

  const response = await axios.get(fileUrl, {
    responseType: "stream",
  });

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    response.data.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
};

import { format } from "util";
import { Storage } from "@google-cloud/storage";
import constants from "../constants";
import { UploadedFile } from "express-fileupload";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);

export default {
  uploadFile: (file: UploadedFile, folder: string) => {
    return new Promise<string>((resolve, reject) => {
      if (!file) {
        reject("No file uploaded");
      }
      if (file.size > constants.MAX_FILE_SIZE) {
        reject("File size too large");
      }
      const newFileName = file.name.replace(/ /g, "_") + Date.now();
      const fileUpload = bucket.file(`${folder}/${newFileName}`);

      const blobStream = fileUpload.createWriteStream({
        resumable: false,
      });
      blobStream.on("error", (error) => {
        reject("Something is wrong! Unable to upload at the moment.");
      });

      blobStream.on("finish", () => {
        const url = format(
          `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
        );
        resolve(url);
      });

      blobStream.end(file.data);
    });
  },
};

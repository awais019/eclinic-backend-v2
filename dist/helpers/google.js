"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const storage_1 = require("@google-cloud/storage");
const constants_1 = __importDefault(require("../constants"));
const storage = new storage_1.Storage({
    keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);
exports.default = {
    uploadFile: (file, folder) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject("No file uploaded");
            }
            if (file.size > constants_1.default.MAX_FILE_SIZE) {
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
                const url = (0, util_1.format)(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
                resolve(url);
            });
            blobStream.end(file.data);
        });
    },
};
//# sourceMappingURL=google.js.map
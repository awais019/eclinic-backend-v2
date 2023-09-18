"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
exports.default = {
    uploadFile: (file, folder) => __awaiter(void 0, void 0, void 0, function* () {
        const newName = `${(0, crypto_1.randomUUID)()}${path_1.default.extname(file.name)}`;
        const uploadPath = path_1.default.resolve(`./public/uploads/${folder}/${newName}`);
        yield file.mv(uploadPath);
        return newName;
    }),
};
//# sourceMappingURL=upload.js.map
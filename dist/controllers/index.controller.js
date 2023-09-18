"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../helpers"));
exports.default = (req, res) => {
    return helpers_1.default.sendAPISuccess(res, "Server is up and Running!");
};
//# sourceMappingURL=index.controller.js.map
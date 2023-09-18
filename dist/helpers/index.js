"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("../constants"));
exports.default = {
    sendAPIError: function (res, error, code = constants_1.default.BAD_REQUEST_CODE) {
        return res.status(code).send(error.message);
    },
    sendAPISuccess: function (res, data, code = constants_1.default.SUCCESS_CODE, message = "") {
        if (message && !data) {
            return res.status(code).send({ message });
        }
        else if (!message) {
            return res.status(code).send(data);
        }
        return res.status(code).send({ message, data });
    },
};
//# sourceMappingURL=index.js.map
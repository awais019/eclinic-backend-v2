"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1() {
    return function (req, res, next) {
        res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
        res.header("Cross-Origin-Resource-Policy", "cross-origin");
        next();
    };
}
exports.default = default_1;
//# sourceMappingURL=static.js.map
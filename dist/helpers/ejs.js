"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = require("ejs");
exports.default = {
    renderHTMLFile: (template, templateData) => {
        return (0, ejs_1.renderFile)(`views/${template}.ejs`, templateData);
    },
};
//# sourceMappingURL=ejs.js.map
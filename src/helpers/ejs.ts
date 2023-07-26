import { renderFile } from "ejs";

export default {
  renderHTMLFile: (template: string, templateData: Object) => {
    return renderFile(`views/${template}.ejs`, templateData);
  },
};

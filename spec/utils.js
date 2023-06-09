export function transformJson(doc, json, options) {
    delete json.__v;
    json.id = json._id;
    delete json._id;
    return json;
  }
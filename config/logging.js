var rfs = require("rotating-file-stream");
var path = require("path");
// create a rotating write stream
console.log("Log path: " +path.join(__dirname, "../../", "log"));
// JSON formatter for morgan logging
function jsonFormat(tokens, req, res) {
  return JSON.stringify({
    "remote-address": tokens["remote-addr"](req, res),
    "remote-user": tokens["remote-user"](req, res),
    time: tokens["date"](req, res, "iso"),
    method: tokens["method"](req, res),
    url: tokens["url"](req, res),
    "http-version": tokens["http-version"](req, res),
    "status-code": tokens["status"](req, res),
    "content-length": tokens["res"](req, res, "content-length"),
    referrer: tokens["referrer"](req, res),
  });
}
const generator = (time, index) => {
  const pad = (num) => (num > 9 ? "" : "0") + num;
  if (!time) return "file(transcribe).log";

  var month = time.getFullYear() + "" + pad(time.getMonth() + 1);
  var day = pad(time.getDate());

  return `${month}/${month}${day}-${index}-file(transcribe).log`;
};
var accessLogStream = rfs.createStream(generator, {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "../../", "log"),
});
module.exports = {
  accessLogStream,
  jsonFormat,
  generator,
};

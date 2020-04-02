
module.exports = {
  parseIp(string) {
    return string.substring(string.indexOf(':', 3) + 1);
  }
};

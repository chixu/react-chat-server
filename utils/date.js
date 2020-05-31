const format = require('./format');

function toFullString(date) {
  // let date = new Date().getMilliseconds;
  return "" + date.getFullYear()
    + format.pad(date.getMonth() + 1, 2)
    + format.pad(date.getDate(), 2)
    + format.pad(date.getHours(), 2)
    + format.pad(date.getMinutes(), 2)
    + format.pad(date.getSeconds(), 2)
    + format.pad(date.getMilliseconds(), 2)
}

function nowFullString() {
  return toFullString(new Date());
}

module.exports = {
  toFullString: toFullString,
  nowFullString: nowFullString,
}
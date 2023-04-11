module.exports = function (content) {
  // 清除 console.log(XXX) 语句
  return content.replace(/console\.log\(.*\);?/g, "")
}
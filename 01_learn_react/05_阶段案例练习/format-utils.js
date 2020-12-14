function formatPrice(price) {
  if (typeof price !== "number") {
    // aaa的话不是数字类型，给默认的0
    // 前面的为真直接用前面的，前面的为false用后面的值，所以适合给默认值
    price = Number("aaa") || 0;
  }
  // 保留两位小数
  return "¥" + price.toFixed(2);
}


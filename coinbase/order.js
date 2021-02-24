// https://docs.pro.coinbase.com/?javascript#place-a-new-order

const { divide, multiply, json } = require("mathjs");
const memory = require("../lib/memory");
const numFix = require("../lib/number.fix");
const request = require("./cb.request");

module.exports = async (opts) => {
  if (process.env.CPBB_DRY_RUN) {
    // fake out a .002 fee subtraction
    const converted = multiply(Number(opts.funds), 0.998);
    return {
      executed_value: Number(opts.funds),
      filled_size: numFix(divide(converted, memory.price), 8),
      settled: true,
    };
  }
  if (process.env.LOG_CORRECTION) {
    return {
      filled_size: process.env.LOG_CORRECTION,
      settled: true,
    };
  }
  const { json } = await request({
    requestPath: "/orders",
    method: "POST",
    body: opts,
  });
  return json;
};

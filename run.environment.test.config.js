module.exports = {
  apps: [{
    name: "cpbb_envirotest",
    script: './environment.test.js',
    watch: ['*.js','coinbase','lib'],
    env: {
      NODE_ENV: "production",
      CPBB_APIPASS: process.env.CPBB_APIPASS||'load your keys via real environmental vars or replace this quoted string',
      CPBB_APIKEY: process.env.CPBB_APIKEY||'load your keys via real environmental vars or replace this quoted string',
      CPBB_APISEC: process.env.CPBB_APISEC||'load your keys via real environmental vars or replace this quoted string',
      CPBB_DRY_RUN: true,
      CPBB_FREQ: "* * * * *",
      CPBB_TICKER: "BTC",
      CPBB_CURRENCY: "USD",
      CPBB_VOL: 10,
      CPBB_APY: 15,
    }
  }]
};

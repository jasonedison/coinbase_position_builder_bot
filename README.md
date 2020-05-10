# Coinbase Position Builder Bot

Position Building Bot for Accumulating Bitcoin (or other currencies) via Coinbase Pro, while taking advantage of pumps.

This bot will make a market taker action of the configured funding level at the configured interval. If the current holdings that that bot has accumulated is at a profit point higher than a target APY, then it will make a sell action, else it makes a buy action.

Here is a view of my first 1 BTC purchased via this method (in a Google Sheet for charting):
![history](docs/cbpp_charts.png "First 1 BTC Accumulated")

After running this engine for a bit, you can copy the data in your local log file (e.g. `./data/history.BTC-USD.tsv`) and paste it into the spreadsheet template: [./docs/CBPP_BTC-Template.xlsx](./docs/CBPP_BTC-Template.xlsx). This template can be saved locally and periodically updated or saved to Google Docs or some other service for backup.

## WARNING
This tool is built for my own personal use--and while I have published it publically for others to use/enjoy, please beware that usage of this tool is at your own risk. I have not accounted for all edge cases as I watch and tune this code as an experiment in-progress.

## Getting Started

Assuming you already have node installed. If not, use [nvm](https://github.com/nvm-sh/nvm)
This also assumes you are running in a Linux/Mac environment with a shell.

```
git clone git@github.com:jasonedison/coinbase_position_builder_bot.git
cd coinbase_position_builder_bot;
npm run setup;

# add Coinbase Pro API Key & password
export CPBB_APIPASS="GET API Password FROM COINBASE PRO"
export CPBB_APIKEY="GET Access Key FROM COINBASE PRO"
export CPBB_APISEC="GET Secret Key FROM COINBASE PRO"

# default start (see below for more options)
node .
```

  NOTE: `CPBB_APIKEY` must have `view`+`trade` permissions--there is no need to allow `transfers`. I also recommend limiting the API keys to IP address whitelists.

## Settings

### Default Configuration
Note: the default settings will take a $10 action every 12 hours on BTCUSD. If Bitcoin sustains a bear market for a full year, this would amount to spending $20/day = $140/week = $7,300/year on Bitcoin (always accumulating). If the price fluctuates enough to cross the profitability threshold (default 15% APY), it may sell upward and sustain itself with a floating balance for a while.

The defaults can be overridden with envronmental variables:
```
export CPBB_APY=15 # 15% APY (sell above this gain)
export CPBB_VOL=10 # take $10 actions at configured frequency
export CPBB_FREQ="5 */8 * * *" # crontab description of task frequency (every 8 hours, on the 33rd minute) - https://crontab.guru/every-8-hours
export CPBB_TICKER=BTC
export CPBB_CURRENCY=USD # this is the account we will take buy/sell actions on (money will move in and out of this, exchanged for CPBB_TICKER)
```

### Volume and Frequency
Unfortunately, the Coinbase Pro API will only allow market taker orders of `$10` or more. So my original idea of buying $1 or $2 worth every hour (or even more frequently) went bust--unless you want to make a $10/hour order, which adds up fast if you are in a continuous recession (always buying mode).

$10/hour = $240/day = $1680/week = $87,600/year max buy.

If you've got an extra $87K/year to build a position into Bitcoin, `more power to you`. But otherwise you might be better off with some of these options:

- $10/(2 hours) = $120/day = $840/week = $43,800/year
  - `CPBB_FREQ='0 */2 * * *' node .`
- $10/(3 hours) = $80/day = $560/week = $29,120/year
  - `CPBB_FREQ='0 */3 * * *' node .`
- $10/(4 hours) = $60/day = $420/week = $21,900/year
  - `CPBB_FREQ='0 */4 * * *' node .`
- $10/(6 hours) = $40/day = $280/week = $14,600/year
  - `CPBB_FREQ='0 */6 * * *' node .`
- `DEFAULT` $10/(8 hours) = $30/day = $210/week = $10,950/year
  - `CPBB_FREQ='0 */8 * * *' node .`
- $10/(12 hours) = $20/day = $140/week = $7,300/year
  - `CPBB_FREQ='0 */12 * * *' node .`
- $10/day = $70/week = $3,650/year (runs at 1am every day)
  - `CPBB_FREQ='0 1 * * *' node .`
- etc...

If you want more crontab frequency options, you can construct your own via https://crontab.guru/

Additionally, could alter the dollar amount and act with `$15` twice a day (for example) like so:
```
CPBB_VOL=15 CPBB_FREQ='0 */12 * * *' node .
```

## Test
Create a Sandbox API account and API Keyset here: https://public.sandbox.pro.coinbase.com/profile/api
Then run the app against the Sandbox API
```
export CPBB_APIPASS="API Password"
export CPBB_APIKEY="SANDBOX API KEY"
export CPBB_APISEC="SANDBOX API SECRET"
CPBB_TEST=1 node .
```

The real coinbase API can also be run in a dry run mode, which will calculate and record transactions into the history log as if actions were taken, even though no buy/sell orders are made against the API.
```
CPBB_DRY_RUN=1 CPBB_FREQ='* * * * *' node .
```

### Test Using PM2
More info on the pm2 ecosystem config: https://pm2.keymetrics.io/docs/usage/application-declaration/#cli
```
pm2 start ecosystem.config.dryrun.js
```

## Keeping Alive: PM2
You can keep this process running on your computer, even across restarts with the help of [PM2](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)

```
# example 
CPBB_FREQ='5 */2 * * *' pm2 start npm --name "cpbb" -- start
```
Then you can use `pm2 startup` and `pm2 save` https://pm2.keymetrics.io/docs/usage/startup/
```
pm2 startup
# paste what it says, then...
pm2 save
```

## History / Logs
This app is built to be entirely self-contained. There is no database or 3rd party (aside from Coinbase as the market source). Activity is logged to a tsv file in the local `./data` directory on disk. 

Here is an example log from my first tests:
```
Time	Price	Holding	Value	Funds	Shares	PeriodRate	ExpectedGain	TotalInput	Target	Diff	EndValue	Realized	TotalValue	Liquid	Profit
2020-01-21T03:23:03.473Z	8656.29	0	0	10	0.00115292	0	0	10	10	-10	10	0	10	0	0
2020-01-21T03:24:03.473Z	8655.89	0.00115292	9.98	10	0.00115297	0.00000344	0	20	20	-10	19.98	0	19.98	-0.02	-0.10%
2020-01-21T03:25:03.473Z	8645.22	0.00230589	19.93	10	0.00115378	0.00000344	0	30	30	-10	29.93	0	29.93	-0.07	-0.22%
2020-01-21T03:26:02.704Z	8646.62	0.00345967	29.91	10	0.00115421	0.00000344	0	40	40	-10.02	39.91	0	39.91	-0.09	-0.12%
2020-01-21T03:27:02.162Z	8646.63	0.00461388	39.89	10	0.00115421	0.00000344	0	50	50	-10.04	49.89	0	49.89	-0.11	-0.15%
2020-01-21T03:28:02.535Z	8645.95	0.00576809	49.87	10	0.0011543	0.00000344	0	60	60	-10.07	59.87	0	59.87	-0.13	-0.16%
2020-01-21T03:29:01.562Z	8645.5	0.00692239	59.85	10	0.00115436	0.00000344	0	70	70	-10.09	69.85	0	69.85	-0.15	-0.18%
2020-01-21T03:30:02.972Z	8646.95	0.00807675	69.84	10	0.00115416	0.00000344	0	80	80	-10.1	79.84	0	79.84	-0.16	-0.17%
2020-01-21T03:31:03.212Z	8649.49	0.00923091	79.84	10	0.00115399	0.00000344	0	90	90	-10.1	89.84	0	89.84	-0.16	-0.15%
2020-01-21T03:32:02.504Z	8646.19	0.0103849	89.79	10	0.00115404	0.00000344	0	100	100	-10.15	99.79	0	99.79	-0.21	-0.18%
2020-01-21T03:33:02.693Z	8651.56	0.01153894	99.83	10	0.00115355	0.00000344	0	110	110	-10.12	109.83	0	109.83	-0.17	-0.13%
2020-01-21T04:35:02.496Z	8670	0.01269249	110.04	10	0.0011511	0.00001123	0	120	120	-9.96	120.04	0	120.04	0.04	0.04%
```

# Projecting Future Gains

We can't predict the future, but we can take historical data and backtest it
as if it will go that way again. The easiest way to do this from our existing history
is to model the price reversing course from the last log back to the start of our history.

There is another provided tool for taking an existing history file and running a projection based on that history repeating in reverse from the last log.

It can be used to examine what it might look like if we alter the volume or APY target in th event that the price reverses in the same pattern as our current log of transactions.

  Note: this model runs using the existing engine log with the price/timestamps listed in the history. So it will model those prices and intervals in reverse. You will need to have run this engine for some amount of time prior to running the future projection tool in order to project from your particular history:

```
CPBB_VOL=20 CPBB_APY=20 node project.forward.js
```

This will examine your current history file (e.g. `./data/history.BTC-USD.tsv`), reverse the data, and run it as projected future events. Then it will save the result in a coorsponding projection file (e.g. `./data/projection.BTC-USD.tsv`).

# Disclaimer
This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. In no event shall the authors, copyright holders, or Coinbase Inc. be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

# Who Am I?

I'm a double-major economics and app development student in NY. I like to play with code as a way of exploring and proving economic theories.

I am not a financial advisor but you can find my occasional takes on twitter: https://twitter.com/cryptecon

import BigNumber from 'bignumber.js'
import * as contractsTestnet from './contractsTestnet'
import * as contracts from './contracts'
import * as actions from './actions'
import * as queries from './graph-queries'

let isTestnet = process.env.NEXT_PUBLIC_CHAINID == 80001

// URLS
let scan = 'https://bscscan.com/'
let cont = contracts

if (isTestnet) {
  scan = 'https://mumbai.polygonscan.com/'
  cont = contractsTestnet
}

export const ETHERSCAN_URL = scan

export const CONTRACTS = cont
export const ACTIONS = actions
export const QUERIES = queries

export const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0)
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const CONE_ADDRESS = '0xA60205802E1B5C6EC1CAFA3cAcd49dFeECe05AC9'.toLowerCase();
export const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'.toLowerCase();
export const NETWORK_TOKEN_NAME = CONTRACTS.FTM_SYMBOL;

export const NETWORK_TOKEN = {
  id: WBNB_ADDRESS,
  address: WBNB_ADDRESS,
  decimals: 18,
  logoURI: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  name: NETWORK_TOKEN_NAME,
  symbol: NETWORK_TOKEN_NAME,
};

export const RENAME_ASSETS = {
  "miMATIC": "MAI"
}

export const BLACK_LIST_TOKENS = []

export const TAXABLE_TOKENS = [
  '0xB58c8c06D18987209a38cB75c04eD80C23D07F10'.toLowerCase(), //  Kamikaze (KZE)
  '0x7DF1938170869AFE410098540c051A8A50308988'.toLowerCase(), //  USDFI
  '0x9f8BB16f49393eeA4331A39B69071759e54e16ea'.toLowerCase(), //  MDB+
  '0x0C347A3e3c5438b603064BC9AB84Adad4E165Faf'.toLowerCase(),
]

export const BASE_ASSETS_WHITELIST = [
  {
    id: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    chainId: "56",
    symbol: "USDC",
    logoURI: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png"
  },
  {
    id: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    chainId: "56",
    symbol: "WETH",
    logoURI: "https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png"
  },
  {
    id: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    address: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    chainId: "56",
    symbol: "DAI",
    logoURI: "https://tokens.pancakeswap.finance/images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png"
  },
  {
    id: "0x3f56e0c36d275367b8c502090edf38289b3dea0d",
    address: "0x3f56e0c36d275367b8c502090edf38289b3dea0d",
    chainId: "56",
    symbol: "MAI",
    logoURI: "https://assets.coingecko.com/coins/images/15264/small/mimatic-red.png"
  },
  {
    id: "0x55d398326f99059ff775485246999027b3197955",
    address: "0x55d398326f99059ff775485246999027b3197955",
    chainId: "56",
    symbol: "USDT",
    logoURI: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png"
  },
  {
    id: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    chainId: "56",
    symbol: "WBNB",
    logoURI: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png"
  },
  {
    id: "0x90c97f71e18723b0cf0dfa30ee176ab653e89f40",
    address: "0x90c97f71e18723b0cf0dfa30ee176ab653e89f40",
    chainId: "56",
    symbol: "FRAX",
  },
  {
    id: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    chainId: "56",
    symbol: "BUSD",
    logoURI: "https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png"
  },
  {
    id: CONE_ADDRESS,
    address: CONE_ADDRESS,
    chainId: "56",
    symbol: "CONE",
    logoURI: "https://icons.llama.fi/cone.png"
  },
];

const ROUTE_ASSETS_SYMBOLS = [
  "USDC",
  "WBNB",
  "BUSD",
  "CONE",
  "USD+",
  // "USDT",
  // "MAI",
];

export const ROUTE_ASSETS = BASE_ASSETS_WHITELIST.filter(x => ROUTE_ASSETS_SYMBOLS.includes(x.symbol));

export const DEFAULT_ASSET_FROM = CONTRACTS.FTM_SYMBOL
export const DEFAULT_ASSET_TO = "0xA60205802E1B5C6EC1CAFA3cAcd49dFeECe05AC9"

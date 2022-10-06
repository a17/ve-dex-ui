export const dystopiaLibraryABI = [{
  "inputs": [{"internalType": "address", "name": "_router", "type": "address"}],
  "stateMutability": "nonpayable",
  "type": "constructor"
}, {
  "inputs": [],
  "name": "factory",
  "outputs": [{"internalType": "contract IFactory", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "address",
    "name": "tokenIn",
    "type": "address"
  }, {"internalType": "address", "name": "tokenOut", "type": "address"}, {
    "internalType": "bool",
    "name": "stable",
    "type": "bool"
  }],
  "name": "getAmountOut",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "tokenIn", "type": "address"}, {
    "internalType": "address",
    "name": "tokenOut",
    "type": "address"
  }, {"internalType": "bool", "name": "stable", "type": "bool"}],
  "name": "getMinimumValue",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "tokenA", "type": "address"}, {
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
  }, {"internalType": "bool", "name": "stable", "type": "bool"}],
  "name": "getNormalizedReserves",
  "outputs": [{"internalType": "uint256", "name": "reserveA", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "reserveB",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "tokenIn", "type": "address"}, {
    "internalType": "address",
    "name": "tokenOut",
    "type": "address"
  }, {"internalType": "bool", "name": "stable", "type": "bool"}],
  "name": "getSample",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "address",
    "name": "tokenIn",
    "type": "address"
  }, {"internalType": "address", "name": "tokenOut", "type": "address"}, {
    "internalType": "bool",
    "name": "stable",
    "type": "bool"
  }],
  "name": "getTradeDiff",
  "outputs": [{"internalType": "uint256", "name": "a", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "b",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "address",
    "name": "tokenIn",
    "type": "address"
  }, {"internalType": "address", "name": "pair", "type": "address"}],
  "name": "getTradeDiff",
  "outputs": [{"internalType": "uint256", "name": "a", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "b",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "address",
    "name": "tokenIn",
    "type": "address"
  }, {"internalType": "address", "name": "tokenOut", "type": "address"}, {
    "internalType": "bool",
    "name": "stable",
    "type": "bool"
  }],
  "name": "getTradeDiff2",
  "outputs": [{"internalType": "uint256", "name": "a", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "b",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "address",
    "name": "tokenIn",
    "type": "address"
  }, {"internalType": "address", "name": "tokenOut", "type": "address"}, {
    "internalType": "bool",
    "name": "stable",
    "type": "bool"
  }],
  "name": "getTradeDiff3",
  "outputs": [{"internalType": "uint256", "name": "a", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "b",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {
    "internalType": "address",
    "name": "tokenIn",
    "type": "address"
  }, {"internalType": "address", "name": "tokenOut", "type": "address"}, {
    "internalType": "bool",
    "name": "stable",
    "type": "bool"
  }, {"internalType": "uint256", "name": "sample", "type": "uint256"}],
  "name": "getTradeDiffSimple",
  "outputs": [{"internalType": "uint256", "name": "a", "type": "uint256"}, {
    "internalType": "uint256",
    "name": "b",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "tokenA", "type": "address"}, {
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
  }, {"internalType": "bool", "name": "stable", "type": "bool"}],
  "name": "pairFor",
  "outputs": [{"internalType": "address", "name": "pair", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "router",
  "outputs": [{"internalType": "contract IRouter", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "tokenA", "type": "address"}, {
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
  }],
  "name": "sortTokens",
  "outputs": [{"internalType": "address", "name": "token0", "type": "address"}, {
    "internalType": "address",
    "name": "token1",
    "type": "address"
  }],
  "stateMutability": "pure",
  "type": "function"
}]

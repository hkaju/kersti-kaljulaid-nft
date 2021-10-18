require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("hardhat-contract-sizer");
require("hardhat-watcher");
require("hardhat-gas-reporter");
require("hardhat-deploy");

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    rinkeby: {
      // url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_PROJECT_ID}`,
      accounts: [process.env.RINKEBY_DEPLOYER],
    },
    mainnet: {
      // url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_PROJECT_ID}`,
      accounts: [process.env.MAINNET_DEPLOYER],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  watcher: {
    dev: {
      tasks: ["compile", "test"],
      files: ["contracts/*.sol", "test/*.js"],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    gasPrice: 200,
    coinmarketcap: process.env.CMC_API_KEY,
  },
  contractSizer: {
    runOnCompile: process.env.REPORT_CONTRACT_SIZE ? true : false,
  },
};

require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");

require("dotenv").config();

// // This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// Hardhat Tasks:
require("./scripts/deployment-script");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// import("hardhat/config").HardhatUserConfig;

module.exports = {
  contractSizer: {
    alphaSort: false,
    runOnCompile: true,
    disambiguatePaths: false,
  },

  defaultNetwork: "hardhat",

  gasReporter: {
    currency: "USD",
    gasPrice: 100,
  },

  networks: {
    develop: {
      url: "http://127.0.0.1:8545",
      gas: 6000000,
      timeout: 200000,
    },
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      },
      accounts: [
        // 5 accounts with 10^14 ETH each
        // Addresses:
        //   0x0e0b5a3f244686cf9e7811754379b9114d42f78b
        //   0x704cf59b16fd50efd575342b46ce9c5e07076a4a
        //   0x0a057a7172d0466aef80976d7e8c80647dfd35e3
        //   0x68dfc526037e9030c8f813d014919cc89e7d4d74
        //   0x26c43a1d431a4e5ee86cd55ed7ef9edf3641e901
        {
          privateKey:
            "0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908b",
          balance: "100000000000000000000000000000000",
        },
        {
          privateKey:
            "0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908c",
          balance: "100000000000000000000000000000000",
        },
        {
          privateKey:
            "0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908d",
          balance: "100000000000000000000000000000000",
        },
        {
          privateKey:
            "0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908e",
          balance: "100000000000000000000000000000000",
        },
        {
          privateKey:
            "0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908f",
          balance: "100000000000000000000000000000000",
        },
      ],
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },

  paths: {
    sources: "./contracts",
    tests: "./test/",
  },

  mocha: {
    timeout: 0,
  },

  etherscan: {
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_KEY,
  },
};

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (PRIVATE_KEY != undefined) {
  module.exports.networks.rinkeby = {
    url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
    accounts: [PRIVATE_KEY],
    timeout: 20000,
  };

  module.exports.networks.mainnet = {
    url: `https://mainnet/infura.io/v3/${process.env.INFURA_KEY}`,
    accounts: [PRIVATE_KEY],
    timeout: 20000,
  };
}

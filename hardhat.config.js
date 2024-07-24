require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-web3");
// require("@nomicfoundation/hardhat-ignition");
// require("@nomicfoundation/hardhat-verify");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    //  ethereum: {
    //   url: "https://mainnet.infura.io/v3/",
    //   chainId: 1,
    //   accounts: [PRIVATE_KEY],
    // },
    //   op_local: {
    //     url: "http://127.0.0.1:22222",
    //     chainId: 10,
    //     accounts,
    //   },
    //   bsc_local: {
    //     url: "http://127.0.0.1:22221",
    //     chainId: 56,
    //     accounts,
    //   },
    //   avalanche_local: {
    //     url: "http://127.0.0.1:22220",
    //     chainId: 43114,
    //     accounts,
    //   }
    // },
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,

    // apiKey: {
    //   bsc: process.env.API_KEY_BSC as string,
    //   avalanche: process.env.API_KEY_AVAX as string,
    //   optimisticEthereum: process.env.API_KEY_OP as string,
    // },
  },
};

require("dotenv").config({ path: ".env.local" });
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    kiteTestnet: {
      url: "https://rpc-testnet.gokite.ai",
      chainId: 2368,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

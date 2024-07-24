const { ethers } = require("hardhat");
const dotenv = require("dotenv");
const fs = require("fs");
const stringify = require("dotenv-stringify");

async function getEvents() {
  dotenv.config();
  const accounts = await ethers.getSigners();
  const sender = accounts[0].address;
  const service = accounts[1].address;
  console.log("Sender address: ", sender);

  const network = hre.network.name;
  const envConfig = dotenv.parse(fs.readFileSync(`.env-${network}`));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }

  console.log("Genereting...");

  const amount = toWei("200");
  const message = ethers.utils.solidityKeccak256(
    ["uint256", "uint256", "address", "string"],
    [nonce, amount, sender, SYMBOL]
  );

  const signature = await web3.eth.sign(message, service.address);
  console.log("Signature:");
  const sig = ethers.utils.splitSignature(signature);
  console.log("Split Signature:");
}

getEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

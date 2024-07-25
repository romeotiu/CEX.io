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

  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  const abi = ["event RewardPaid(address indexed user, uint256 amount)"];
  const contract = new ethers.Contract(rewardContract, abi, provider);

  const filter = contract.filters.RewardPaid();

  // const rewards = filter.map((filter) => ({
  //   user: filter.args.user,
  //   amount: filter.args.amount.toString(),
  //   nonce: filter.args.nonce.toString(),
  //   transactionHash: filter.transactionHash,
  // }));

  // console.log(filter);
  // console.log(rewards);
  console.log("alice", alice.address);
  console.log("service", service.address);

  // fs.writeFileSync("rewards.json", JSON.stringify(rewards, null, 2));;
}

getEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

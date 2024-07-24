const { ethers } = require("hardhat");
const dotenv = require("dotenv");
const fs = require("fs");
const stringify = require("dotenv-stringify");

async function main() {
  const admin = "0xd1d8AE2b259564a3C02A0A78A897ddcFAf8720eD";
  const service = "0x700e0b496a19cfd4e253c34b0452a33719ebe07d";
  const TestERC20 = await ethers.getContractFactory("TestERC20");
  const RewardContract = await ethers.getContractFactory("RewardContract");

  const token = await TestERC20.deploy();
  await token.deployed();

  const toWei = (value) => ethers.utils.parseUnits(value, 18);

  const rewardContract = await RewardContract.deploy(
    token.address,
    admin,
    service
  );
  await rewardContract.deployed();

  console.log(`rewardContract Contract deployed to ${rewardContract.address}`);
  console.log(`token Contract deployed to ${token.address}`);

  await token.transfer(rewardContract.address, toWei("1000000"), {
    from: admin,
  });

  // const envConfig = dotenv.parse(fs.readFileSync(`.env-${network}`));
  // for (const k in envConfig) {
  //   process.env[k] = envConfig[k];
  // }

  // envConfig["REWARD_CONTRACT"] = rewardContract.address;
  // fs.writeFileSync(`.env-${network}`, stringify(envConfig));

  // envConfig["TOKEN_CONTRACT"] = token.address;
  // fs.writeFileSync(`.env-${network}`, stringify(envConfig));
}

// async function verify(contractAddress, args) {
//   console.log("Verifyingg.......");

//   try {
//     await run("verify:verify", {
//       addres: contractAddress,
//       constructorArguments: args,
//     });
//   } catch (e) {
//     if ((e, message.toLowerCase().includes("already verified"))) {
//       console.log("Already Verified");
//     } else {
//       console.log(e);
//     }
//   }
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

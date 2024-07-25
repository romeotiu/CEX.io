const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");

const fs = require("fs");
const stringify = require("dotenv-stringify");

const toWei = (value) => ethers.utils.parseUnits(value, 18);
const toBN = (num) => {
  if (typeof num == "string") return new BigNumber(num);
  return new BigNumber(num.toString());
};

const SYMBOL = "RT";
let nonce = 1;

describe("RewardContract", function () {
  async function deployWithFixture() {
    const [admin, service, alice, bob] = await ethers.getSigners();

    const TestERC20 = await ethers.getContractFactory("TestERC20");
    const RewardContract = await ethers.getContractFactory("RewardContract");

    const token = await TestERC20.deploy();
    const rewardContract = await RewardContract.deploy(
      token.address,
      admin.address,
      service.address
    );

    await token.transfer(rewardContract.address, toWei("1000000"), {
      from: admin.address,
    });

    return { token, rewardContract, alice, bob, service, admin };
  }

  it("claim tokens", async function () {
    const { token, rewardContract, alice, bob, service, admin } =
      await loadFixture(deployWithFixture);

    await rewardContract
      .connect(admin)
      .updateRewardToken(token.address, true, false, SYMBOL);
    expect(await token.balanceOf(rewardContract.address)).to.be.equal(
      toWei("1000000")
    );

    const amount = toWei("200");
    const message = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "string"],
      [nonce, amount, alice.address, SYMBOL]
    );

    expect(await token.balanceOf(alice.address)).to.be.equal(0);

    const signature = await web3.eth.sign(message, service.address);
    const sig = ethers.utils.splitSignature(signature);

    const tx = await rewardContract
      .connect(service)
      .claimReward(nonce, amount, alice.address, sig.v, sig.r, sig.s, SYMBOL);

    await expect(tx)
      .to.emit(rewardContract, "RewardPaid")
      .withArgs(alice.address, amount);
  });

  it("claim tokens with nonce", async function () {
    const { token, rewardContract, alice, bob, service, admin } =
      await loadFixture(deployWithFixture);

    await rewardContract
      .connect(admin)
      .updateRewardToken(token.address, true, false, SYMBOL);
    expect(await token.balanceOf(rewardContract.address)).to.be.equal(
      toWei("1000000")
    );

    const amount = toWei("200");
    // ALICE
    const message = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "string"],
      [nonce, amount, alice.address, SYMBOL]
    );

    expect(await token.balanceOf(alice.address)).to.be.equal(0);

    const signature = await web3.eth.sign(message, service.address);
    const sig = ethers.utils.splitSignature(signature);

    const tx = await rewardContract
      .connect(service)
      .claimReward2(amount, alice.address, sig.v, sig.r, sig.s, SYMBOL);

    await expect(tx)
      .to.emit(rewardContract, "RewardPaid")
      .withArgs(alice.address, amount);

    expect(await rewardContract.nonces(alice.address)).to.be.equal(1);
    expect(await token.balanceOf(alice.address)).to.be.equal(toWei("200"));

    // BOB
    nonce += 1;
    const message2 = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "string"],
      [nonce, amount, bob.address, SYMBOL]
    );

    expect(await token.balanceOf(bob.address)).to.be.equal(0);

    const signature2 = await web3.eth.sign(message2, service.address);
    const sig2 = ethers.utils.splitSignature(signature2);

    const tx2 = await rewardContract
      .connect(service)
      .claimReward2(amount, bob.address, sig2.v, sig2.r, sig2.s, SYMBOL);

    await expect(tx2)
      .to.emit(rewardContract, "RewardPaid")
      .withArgs(bob.address, amount);

    expect(await rewardContract.nonces(bob.address)).to.be.equal(2);
    expect(await token.balanceOf(bob.address)).to.be.equal(toWei("200"));
  });

  it("get events", async function () {
    const { token, rewardContract, alice, bob, service, admin } =
      await loadFixture(deployWithFixture);

    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:8545"
    );

    await rewardContract
      .connect(admin)
      .updateRewardToken(token.address, true, false, SYMBOL);
    expect(await token.balanceOf(rewardContract.address)).to.be.equal(
      toWei("1000000")
    );

    const amount = toWei("200");
    const message = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "string"],
      [nonce, amount, alice.address, SYMBOL]
    );

    expect(await token.balanceOf(alice.address)).to.be.equal(0);

    const signature = await web3.eth.sign(message, service.address);
    const sig = ethers.utils.splitSignature(signature);

    const tx = await rewardContract
      .connect(service)
      .claimReward(nonce, amount, alice.address, sig.v, sig.r, sig.s, SYMBOL);

    await expect(tx)
      .to.emit(rewardContract, "RewardPaid")
      .withArgs(alice.address, amount);

    const abi = ["event RewardPaid(address indexed user, uint256 amount)"];
    const contract = new ethers.Contract(rewardContract, abi, provider);

    // const filter = contract.filters.RewardPaid( alice.address );
    const filter = contract.filters.eLog();

    let iface = new ethers.utils.Interface(abi);

    const logs = await provider.getLogs({});
    try {
      console.log("Printing array of events:");
      // let events = logs.map((log) => iface.parseLog(log));
      // console.log(events);
    } catch (e) {
      console.log(e);
    }

    // const rewards = filter.map((filter) => ({
    //   user: filter.args.user,
    //   amount: filter.args.amount.toString(),
    // } ) );

    // console.log(filter);

    // let iface = new ethers.utils.Interface(abi);

    // console.log(iface.parseLog(filter.topics[1]));
    // const parsedLog = contract.interface.parseLog(filter.topics[1]);
    // console.log(parsedLog);
    // getLogs.then((logs) => {
    //   logs.forEach((log) => {
    //     console.log(iface.parseLog(log));
    //   });
    // });

    // fs.writeFileSync("rewards.json", JSON.stringify(rewards, null, 2));
  });
});

// filter.topics?.forEach((event) => {
//   console.log("=>>>", event);
//   console.log(iface.parseLog(event));
// } );

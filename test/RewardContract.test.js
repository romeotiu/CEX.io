const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");

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
});

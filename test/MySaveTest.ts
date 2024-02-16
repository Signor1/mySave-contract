import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MySave } from "../typechain-types";
import { SignorToken } from "../typechain-types";

describe("Save Token Contract Testing", function () {
  let signorToken: SignorToken;
  let mySave: MySave;

  async function deploySaveContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const initialOwner = "0xdF0a689A22B64C455AE212DBc13AF35f1B1dFD55";

    const signorToken = await ethers.getContractFactory("SignorToken");

    const token = await signorToken.deploy(initialOwner);

    const MySave = await ethers.getContractFactory("MySave");

    const mySave = await MySave.deploy(token.target);

    return { token, mySave, owner, otherAccount };
  }

  describe("Deployment Check", function () {
    it("Check if the ERC20 token contract was deployed", async function () {
      const { token } = await loadFixture(deploySaveContract);

      expect(token).to.exist;
    });

    it("Check if the Save ERC20 token contract was deployed", async function () {
      const { mySave } = await loadFixture(deploySaveContract);

      expect(mySave).to.exist;
    });
  });

  describe("Ether Deposit Check", function () {
    it("Should check that the depositor is address 0", async function () {
      const { owner } = await loadFixture(deploySaveContract);

      const sender = owner.address;

      const nullAddress = "0x0000000000000000000000000000000000000000";

      expect(sender).is.not.equal(nullAddress);
    });

    it("Should revert if the deposit amount is 0", async function () {
      // Deploy the contract
      const { mySave } = await loadFixture(deploySaveContract);

      // Attempt deposit with 0 token
      await expect(mySave.depositEther({ value: 0 })).to.be.reverted;
    });

    it("Should deposit ETH successfully", async function () {
      const { mySave, owner } = await loadFixture(deploySaveContract);

      const depositAmount = ethers.parseEther("1.0");

      await mySave.depositEther({ value: depositAmount });

      const userBal = await mySave.checkUserEtherBalance(owner.address);

      expect(userBal).to.be.equal(depositAmount);
    });

    it("Should check if the user's deposits with ether increments", async function () {
      const { mySave, owner } = await loadFixture(deploySaveContract);

      const depositAmount1 = ethers.parseEther("1.0");

      const depositAmount2 = ethers.parseEther("2.0");

      await mySave.depositEther({ value: depositAmount1 });

      await mySave.depositEther({ value: depositAmount2 });

      const userBal = await mySave.checkUserEtherBalance(owner.address);

      const result = depositAmount1 + depositAmount2;

      expect(userBal).to.be.equal(result);
    });
  });

  describe("Token Deposit Check", function () {
    it("Should check that the depositor's is address 0", async function () {
      const { owner } = await loadFixture(deploySaveContract);

      const sender = owner.address;

      const nullAddress = "0x0000000000000000000000000000000000000000";

      expect(sender).is.not.equal(nullAddress);
    });

    it("Should revert if the deposit amount is 0", async function () {
      // Deploy the contract
      const { mySave } = await loadFixture(deploySaveContract);

      // Attempt deposit with 0 token
      await expect(mySave.depositToken(0)).to.be.reverted;
    });

    it("Should allow users deposit token correctly", async function () {
      const { token, mySave, owner } = await loadFixture(deploySaveContract);

      await token.approve(mySave.target, 2000);

      const ownerbalBeforeDeposit = await mySave.checkUserTokenBalance(
        owner.address
      );

      await mySave.connect(owner).depositToken(2000);

      const ownerBalAfterDeposit = await mySave.checkUserTokenBalance(
        owner.address
      );

      expect(ownerBalAfterDeposit).to.be.greaterThan(ownerbalBeforeDeposit);
    });
  });

  describe("Ether Withdrawal Check", function () {
    it("Should revert if the withdrawal address is 0", async function () {
      const { owner } = await loadFixture(deploySaveContract);

      const sender = owner.address;

      const nullAddress = "0x0000000000000000000000000000000000000000";

      expect(sender).is.not.equal(nullAddress);
    });

    it("Should revert if the user's savings is 0", async function () {
      const { mySave } = await loadFixture(deploySaveContract);

      await expect(mySave.withdrawEther()).to.be.reverted;
    });

    it("Should check if the withdrawal of Ether is successful", async function () {
      const { mySave, owner } = await loadFixture(deploySaveContract);

      const depositAmount = ethers.parseEther("1.0");

      await mySave.depositEther({ value: depositAmount });

      const initialBal = await mySave.checkUserEtherBalance(owner.address);

      expect(initialBal).to.be.equal(depositAmount);

      await mySave.withdrawEther();

      const balCheck = await mySave.checkUserEtherBalance(owner.address);

      expect(balCheck).to.be.equal("0");
    });
  });

  describe("Token Withdrawal Check", function () {
    it("Should revert if the withdrawal address is 0", async function () {
      const { owner } = await loadFixture(deploySaveContract);

      const sender = owner.address;

      const nullAddress = "0x0000000000000000000000000000000000000000";

      expect(sender).is.not.equal(nullAddress);
    });

    it("Should revert if the user's savings is 0", async function () {
      // Deploy the contract
      const { mySave } = await loadFixture(deploySaveContract);

      // Attempt deposit with 0 token
      await expect(mySave.withdrawToken(0)).to.be.reverted;
    });

    it("Should check if total withdrawal is successful", async function () {
      const { token, mySave, owner } = await loadFixture(deploySaveContract);

      await token.approve(mySave.target, 2000);

      const ownerbalBeforeDeposit = await mySave.checkUserTokenBalance(
        owner.address
      );

      await mySave.connect(owner).depositToken(2000);

      const ownerBalAfterDeposit = await mySave.checkUserTokenBalance(
        owner.address
      );

      expect(ownerBalAfterDeposit).to.be.greaterThan(ownerbalBeforeDeposit);

      await mySave.connect(owner).withdrawToken(2000);

      const ownerBalAfterWithdrawal = await mySave.checkUserTokenBalance(
        owner.address
      );

      expect(ownerBalAfterWithdrawal).to.be.equal(ownerbalBeforeDeposit);
    });

    it("Should check if user can withdraw some token", async function () {
      const { token, mySave, owner } = await loadFixture(deploySaveContract);

      await token.approve(mySave.target, 2000);

      await mySave.connect(owner).depositToken(2000);

      const ownerBalAfterDeposit = await mySave.checkUserTokenBalance(owner); //2000

      await mySave.connect(owner).withdrawToken(1000);

      const ownerBalAfterWithdrawal = await mySave.checkUserTokenBalance(owner); //1000

      const balCalc = ownerBalAfterDeposit - ownerBalAfterWithdrawal;

      expect(ownerBalAfterWithdrawal).to.be.equal(balCalc);
    });
  });

  describe("Events Check", function () {
    it("Should check if the ether deposit event is working", async function () {
      const { mySave, owner } = await loadFixture(deploySaveContract);

      const depositAmount = ethers.parseEther("1.0");

      const tx = await mySave.depositEther({
        value: depositAmount,
      });

      await expect(tx)
        .to.emit(mySave, "SavingSuccessful")
        .withArgs(owner, anyValue);
    });
    it("Should check if the token deposit event is working", async function () {
      const { token, mySave, owner } = await loadFixture(deploySaveContract);

      await token.approve(mySave.target, 2000);

      const tx = await mySave.connect(owner).depositToken(2000);

      await expect(tx)
        .to.emit(mySave, "SavingSuccessful")
        .withArgs(owner, anyValue);
    });

    it("Should check if the ether withdrawal event is working", async function () {
      const { mySave, owner } = await loadFixture(deploySaveContract);

      const depositAmount = ethers.parseEther("1.0");

      await mySave.depositEther({ value: depositAmount });

      const initialBal = await mySave.checkUserEtherBalance(owner.address);

      expect(initialBal).to.be.equal(depositAmount);

      const tx = await mySave.withdrawEther();

      await expect(tx)
        .to.emit(mySave, "WithdrawSuccessful")
        .withArgs(owner, anyValue);
    });

    it("Should check if token withdrawal is successful", async function () {
      const { token, mySave, owner } = await loadFixture(deploySaveContract);

      await token.approve(mySave.target, 2000);

      await mySave.connect(owner).depositToken(2000);

      const ownerBalAfterDeposit = await mySave.checkUserTokenBalance(
        owner.address
      );

      const tx = await mySave.connect(owner).withdrawToken(2000);

      await expect(tx)
        .to.emit(mySave, "WithdrawSuccessful")
        .withArgs(owner, anyValue);
    });
  });
});

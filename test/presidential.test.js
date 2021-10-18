const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PresidentialNFT", async () => {
  let contract;

  beforeEach(async () => {
    await deployments.fixture(["PresidentialNFT"]);
    contract = await ethers.getContract("PresidentialNFT");

    // Transfer ownership to the owner address
    const [_, owner] = await ethers.getSigners();
    await contract.transferOwnership(owner.address);
  });

  describe("Token metadata", async () => {
    it("Should return a string", async () => {
      for (let i = 1; i < 10; i++) {
        expect(await contract.tokenURI(i)).to.be.a("string");
      }
    });

    it("Should be base64-encoded", async () => {
      for (let i = 1; i < 10; i++) {
        expect(await contract.tokenURI(i)).to.satisfy((metadata) =>
          metadata.startsWith("data:application/json;base64,")
        );
      }
    });

    it("Should decode into valid JSON", async () => {
      for (let i = 1; i < 10; i++) {
        const metadata = await contract.tokenURI(i);
        const encodedJSON = metadata.replace(
          "data:application/json;base64,",
          ""
        );
        const decodedJSON = Buffer.from(encodedJSON, "base64").toString();
        const data = JSON.parse(decodedJSON);

        expect(data).to.be.a("object");
      }
    });

    it("Should return original token metadata for token #0", async () => {
      const metadata = await contract.tokenURI(0);
      const encodedJSON = metadata.replace("data:application/json;base64,", "");
      const decodedJSON = Buffer.from(encodedJSON, "base64").toString();
      const data = JSON.parse(decodedJSON);

      expect(data.name).to.equal("President Kersti Kaljulaid");
      expect(data.description).to.equal(
        "The original NFT accompanying President Kaljulaid's portrait (painted by Alice Kask) gifted to her on 09.10.2021."
      );
      expect(data.image).to.equal(
        "ipfs://QmY5Wgvv5atmTZPW5mNEuFa8f9JcNoaWRUPPCixbQN2Dib"
      );
    });

    it("Should return print metadata for tokens #1+", async () => {
      for (let i = 1; i < 10; i++) {
        const metadata = await contract.tokenURI(i);
        const encodedJSON = metadata.replace(
          "data:application/json;base64,",
          ""
        );
        const decodedJSON = Buffer.from(encodedJSON, "base64").toString();
        const data = JSON.parse(decodedJSON);

        expect(data.name).to.equal(`Print #${i} of President Kersti Kaljulaid`);
        expect(data.description).to.equal(
          `This is a copy of the original NFT gifted to President Kersti Kaljulaid. 1826 are freely mintable by anyone, one for each day she was in office.`
        );
        expect(data.image).to.equal(
          "ipfs://QmY5Wgvv5atmTZPW5mNEuFa8f9JcNoaWRUPPCixbQN2Dib"
        );
      }
    });

    it("Should let the owner update IPFS hash", async () => {
      const [_, owner] = await ethers.getSigners();

      expect(contract.connect(owner).setIpfsHash("test")).not.to.be.reverted;

      const metadata = await contract.tokenURI(0);
      const encodedJSON = metadata.replace("data:application/json;base64,", "");
      const decodedJSON = Buffer.from(encodedJSON, "base64").toString();
      const data = JSON.parse(decodedJSON);

      expect(data.image).to.equal("ipfs://test");
    });

    it("Should not let anyone else update IPFS hash", async () => {
      expect(contract.setIpfsHash("test")).to.be.reverted;
    });
  });

  describe("Minting", async () => {
    it("Should let anyone mint prints", async () => {
      await expect(contract.mint()).not.to.be.reverted;
    });

    it("Should increment print token IDs starting from 1", async () => {
      const signers = await ethers.getSigners();

      for (let i = 0; i < 10; i++) {
        const mintTxn = await contract.connect(signers[i]).mint();
        const minedTxn = await mintTxn.wait();

        expect(minedTxn.events[0].event).to.equal("Transfer");
        expect(minedTxn.events[0].args.tokenId).to.equal(i + 1);
      }
    });

    it("Should increment current print count", async () => {
      const countBefore = await contract.currentPrintCount();
      await contract.mint();
      const countAfter = await contract.currentPrintCount();
      expect(countAfter.sub(countBefore)).to.equal(1);
    });

    it("Should send the print to the minter's wallet", async () => {
      const [signer] = await ethers.getSigners();
      await contract.mint();
      const balance = await contract.balanceOf(signer.address);
      expect(balance).to.equal(1);
    });

    it("Should not let the same wallet mint twice", async () => {
      await contract.mint();
      await expect(contract.mint()).to.be.reverted;
    });

    it("Should let different wallets mint", async () => {
      const signers = await ethers.getSigners();
      for (const signer of signers.slice(0, 10)) {
        await expect(contract.connect(signer).mint()).not.to.be.reverted;
      }
    });

    xit("Should not let you mint more than the max supply of prints", async () => {
      const maxPrintCount = await contract.MAX_PRINT_COUNT();

      for (let i = 0; i < maxPrintCount + 1; i++) {
        await contract.mint();
      }

      await expect(contract.mint()).to.be.reverted;
    });

    it("Should let contract owner mint the original", async () => {
      const [signer, owner] = await ethers.getSigners();
      await expect(contract.connect(owner).claim(signer.address)).not.to.be
        .reverted;
    });

    it("Should not let the original to be minted twice", async () => {
      const [signer, owner] = await ethers.getSigners();
      await expect(contract.connect(owner).claim(signer.address)).not.to.be
        .reverted;
      await expect(contract.connect(owner).claim(signer.address)).to.be
        .reverted;
    });

    it("Should not let anyone else mint the original", async () => {
      const [signer] = await ethers.getSigners();
      await expect(contract.claim(signer.address)).to.be.reverted;
    });

    it("Should send the original to the destination address", async () => {
      const [signer, owner] = await ethers.getSigners();
      await contract.connect(owner).claim(signer.address);
      const balance = await contract.balanceOf(signer.address);
      expect(balance).to.equal(1);
    });
  });
});

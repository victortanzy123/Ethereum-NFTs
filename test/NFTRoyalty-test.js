const chai = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("@ethersproject/bignumber");

// need to instantiate for CHAI properties to work:
chai.use(solidity);
const { expect, revertedWith } = chai;

/// Hardhat Test Script:
describe("NFT With Royalty Structure", async () => {
  let admin, artist, owner1, owner2, otherAddrs, nft, token;

  // Set royality of Native Token to a denomination of 1 ether : 1 * 10 ** 18
  const txTaxAmount = ethers.utils.parseUnits("1", "ether");

  beforeEach(async () => {
    // Instantiate addresses:
    [admin, artist, owner1, owner2, ...otherAddrs] = await ethers.getSigners();

    // Deploy Native Token Contract: (hardhat method)
    // Total supply minted: 1000 (* 10 ** 18)
    const NativeToken = await ethers.getContractFactory("NativeToken");
    token = await NativeToken.deploy();
    await token.deployed();

    // Transfer Native token to owner1 and owner2 after minting from admin:
    await token.transfer(
      owner1.address,
      ethers.utils.parseUnits("500", "ether")
    );

    await token.transfer(
      owner2.address,
      ethers.utils.parseUnits("500", "ether")
    );

    // Deploy NFT Contract:
    const NFT = await ethers.getContractFactory("NFTRoyalty");
    nft = await NFT.deploy(
      artist.address,
      token.address,
      txTaxAmount,
      "MY NFT",
      "MNFT"
    );
    await nft.deployed();
  });

  /// TEST CASES:
  it("Should EXCLUDE artist from royalty payment list", async () => {
    const exclusionStatusOfArtist = await nft
      .connect(artist)
      .royaltyWaiveList(artist.address);
    await expect(exclusionStatusOfArtist).to.be.equal(true);
  });
  it("Should TRANSFER NFT and PAY Royalties", async () => {
    // Since NFT and Native Token contracts are deployed already:
    await nft.connect(artist).transferFrom(artist.address, owner1.address, 0);

    let ownerOfNFT;
    // Query ownership of NFT:
    ownerOfNFT = await nft.ownerOf(0);

    expect(ownerOfNFT).to.be.equal(owner1.address);

    // Transfer from owner1 to owner2: first need to approve NFT Contract to transfer from on behalf of owner1 (to pay royalty fees, if not transfer/sale of NFT WILL NOT GO THROUGH) (NATIVE TOKEN)
    await token.connect(owner1).approve(nft.address, txTaxAmount);

    // Sell NFT to owner2:
    await nft.connect(owner1).transferFrom(owner1.address, owner2.address, 0);

    ownerOfNFT = await nft.ownerOf(0);

    let balanceOfOwner1, balanceOfArtist, balanceOfOwner2;
    balanceOfOwner1 = await token.balanceOf(owner1.address);
    balanceOfArtist = await token.balanceOf(artist.address);
    balanceOfOwner2 = await token.balanceOf(owner2.address);

    // Ownership:
    expect(ownerOfNFT).to.be.equal(owner2.address);

    // New balances due to royalty payment:
    expect(balanceOfOwner1.toString()).to.be.equal(
      ethers.utils.parseUnits("499", "ether")
    );
    expect(balanceOfArtist.toString()).to.be.equal(
      ethers.utils.parseUnits("1", "ether")
    );
  });

  it("Should NOT transfer NFT if not owner", async () => {
    await expect(
      nft.connect(owner1).transferFrom(artist.address, owner2.address, 0)
    ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
  });

  it("Should NOT pay royalties if in the royaltyWaivalList", async () => {
    // Update royaltyWaivalList:
    await nft.connect(artist).transferFrom(artist.address, owner1.address, 0);

    await expect(await token.balanceOf(artist.address)).to.be.equal(0);

    await nft.connect(artist).setWaiveRoyalty(owner1.address, true);

    // Transferring from owner1 to owner2 without payment of royalty:
    await nft.connect(owner1).transferFrom(owner1.address, owner2.address, 0);

    let balanceOfOwner1, balanceOfArtist;
    balanceOfOwner1 = await token.balanceOf(owner1.address);
    balanceOfArtist = await token.balanceOf(artist.address);

    expect(BigNumber.from(balanceOfOwner1)).to.be.equal(
      ethers.utils.parseUnits("500", "ether")
    );
    expect(BigNumber.from(balanceOfArtist)).to.be.equal(0);
  });

  it("Should NOT transfer NFT if not enough Native Token for Royalty Payment", async () => {
    // First transfer the NFT to owner1 from artist:
    await nft.connect(artist).transferFrom(artist.address, owner1.address, 0);

    // Deplete funds from owner1 by transferring all to owner2
    await token
      .connect(owner1)
      .transfer(owner2.address, ethers.utils.parseUnits("500", "ether"));

    // owner1 approve NFT Contract spending of txTaxAmount:
    await token.connect(owner1).approve(nft.address, txTaxAmount);

    // Expect revert:
    await expect(
      nft.connect(owner1).transferFrom(owner1.address, owner2.address, 0)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Should ADD OR REMOVE from Royalty Waival List", async () => {
    await nft.connect(artist).setWaiveRoyalty(owner1.address, true);

    // Query mapping of NFT Contract: (royaltyWaiveList)
    expect(
      await nft.connect(artist).royaltyWaiveList(owner1.address)
    ).to.be.equal(true);

    await nft.connect(artist).setWaiveRoyalty(owner1.address, false);
    expect(
      await nft.connect(artist).royaltyWaiveList(owner1.address)
    ).to.be.equal(false);
  });

  it("Should NOT allow non-artist to implement exclusion from royalty list", async () => {
    await expect(
      nft.connect(owner2).setWaiveRoyalty(owner1.address, true)
    ).to.be.revertedWith("only artist");
  });
});

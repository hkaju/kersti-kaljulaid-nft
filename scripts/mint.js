async function mint() {
  const contract = await ethers.getContract("PresidentialNFT");
  await contract.mint();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

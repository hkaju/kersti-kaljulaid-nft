async function claim() {
  const presidentialWallet = "0xAfd5bACBD774ECFEa23a054018Afb49b772eA660";

  if (presidentialWallet) {
    const contract = await ethers.getContract("PresidentialNFT");
    await contract.claim(presidentialWallet);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
claim()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

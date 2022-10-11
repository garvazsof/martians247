// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const initMetadataURI = "https://martians247.xyz/";
  const initMartiansWallet = "0xD8532152a3F66bD590F29ce711C8ecCa5542325b";

  const Martians = await hre.ethers.getContractFactory("Martians");
  const martianContract = await Martians.deploy(initMetadataURI,initMartiansWallet);

  await martianContract.deployed();

  console.log(
    `Martians contract deployed to ${martianContract.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

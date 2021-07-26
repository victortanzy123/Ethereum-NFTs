// const { ethers } = require("hardhat");
const { task } = require("hardhat/config");
const { BigNumber } = require("@ethersproject/bignumber");

require("dotenv").config();

require("@nomiclabs/hardhat-ethers");

let DEPLOYED_CONTRACT_ADDRESSES = {};

// Deployment Function:
async function deploy(step, ethers, contract, args) {
  console.log(`   ${parseInt(step) + 1}. Deploying '${contract}'`);
  console.log("   ------------------------------------");

  let instance;

  const Contract = await ethers.getContractFactory(contract);

  if (!args) {
    instance = await Contract.deploy();
  } else {
    instance = await Contract.deploy(
      args[0],
      args[1],
      args[2],
      args[3],
      args[4]
    );
  }

  const tx = await instance.deployed();
  printInfo(tx.deployTransaction);
  console.log(`   > address:\t${instance.address}\n\n`);

  DEPLOYED_CONTRACT_ADDRESSES[contract] = instance.address;
}

// Printing Function:
function printInfo(transaction) {
  console.log(`   > tx hash:\t${transaction.hash}`);
  console.log(`   > gas price:\t${transaction.gasPrice.toString()}`);
  console.log(`   > gas used:\t${transaction.gasLimit.toString()}`);
}

// Execution:
task("deploy", "Deploys the contracts").setAction(async () => {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const contractsToDeploy = ["NativeToken", "NFTRoyalty"];

  // Variables:
  const instances = {};
  let argsForNFTContract,
    tokenContractAddress,
    tx,
    step = 0;

  // Deployment:
  console.log(`Deploying Contracts using ${deployerAddress}`);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("============================\n");

  // 1.) Deploy Native Token Contract:
  instances[contractsToDeploy[0]] = await deploy(
    step,
    ethers,
    contractsToDeploy[0]
  );
  step++;

  // Instantiate Launched Native Token Contract Address:
  tokenContractAddress = DEPLOYED_CONTRACT_ADDRESSES["NativeToken"];
  console.log("tokenContractAddress: ", tokenContractAddress);

  // txTaxAmount:
  const txTaxAmount = 1 * 10 ** 18; // 1 ether denomination

  // Arguments for each Contract constructor:
  argsForNFTContract = [
    deployerAddress,
    tokenContractAddress,
    txTaxAmount.toString(),
    "My NFT",
    "MNFT",
  ];

  // 2.) Deploy NFT with royalties Contract:
  instances[contractsToDeploy[1]] = await deploy(
    step,
    ethers,
    contractsToDeploy[1],
    argsForNFTContract
  );

  // Summary:

  console.log("Summary");
  console.log("=======\n");
  for (let contract of contractsToDeploy) {
    console.log(`   > ${contract}: ${DEPLOYED_CONTRACT_ADDRESSES[contract]}`);
  }

  console.log("\nDeployment complete!");
});

// Deploying Contracts using 0x50eF8FB58b2f7Bb907eDaaF5065D3f880A597441
// Account balance: 790631967932664416
// ============================

//    1. Deploying 'NativeToken'
//    ------------------------------------
//    > tx hash:   0x54de454563e1608256cf52c372b4778643aa4d9fa39803349ac3dbbbb417558c
//    > gas price: 1000000008
//    > gas used:  639253
//    > address:   0x9f2AEe14d2AE88F03e93BDe459C6759A0ed51106

// tokenContractAddress:  0x9f2AEe14d2AE88F03e93BDe459C6759A0ed51106
//    2. Deploying 'NFTRoyalty'
//    ------------------------------------
//    > tx hash:   0x9853912d0cee493313ef5ffa12df46dcfbf61d5c47b93b66c5bfb3720b61316e
//    > gas price: 1000000008
//    > gas used:  1385165
//    > address:   0x640ce4F65e72f0B8948e6fD5096E65BbFb0D4D48

// Summary
// =======

//    > NativeToken: 0x9f2AEe14d2AE88F03e93BDe459C6759A0ed51106
//    > NFTRoyalty: 0x640ce4F65e72f0B8948e6fD5096E65BbFb0D4D48

// Deployment complete!

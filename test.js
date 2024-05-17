const { SuiClient, getFullnodeUrl } = require("@mysten/sui.js/client");
const { TransactionBlock } = require("@mysten/sui.js/transactions");
const { ethers } = require("ethers");
const { Ed25519Keypair } = require("@mysten/sui.js/keypairs/ed25519");
const fs = require("fs");
var inquirer = require("inquirer");
const delay = require("delay");
(async () => {
  let list = await inquirer
    .prompt([
      {
        type: "input",
        name: "selected",
        message: "input your pharse account sender ? ",
      },
    ])
    .then((answers) => {
      return answers.selected;
    });
  let listaddress = await inquirer
    .prompt([
      {
        type: "input",
        name: "selected",
        message: "input list address receiver ? ",
      },
    ])
    .then((answers) => {
      return answers.selected;
    });
  const pharse = fs.readFileSync(list, "utf8").replaceAll("\r").split("\n");
  let jumlah = await inquirer
    .prompt([
      {
        type: "input",
        name: "selected",
        message: "input your amount example (1) ?",
      },
    ])
    .then((answers) => {
      return answers.selected;
    });
  for (let index = 0; index < pharse.length; index++) {
    try {
      const pharseinput = pharse[index];
      const client = new SuiClient({
        url: "https://fullnode.mainnet.sui.io:443",
      });
      const keypair = Ed25519Keypair.deriveKeypair(pharseinput);
      console.log("Try Login with pahrse");
      console.log(
        "wallet address sui =>",
        keypair.getPublicKey().toSuiAddress()
      );
      const txb = new TransactionBlock();
      await txb.setSender(keypair.getPublicKey().toSuiAddress());
      const [coin] = await txb.splitCoins(txb.gas, [
        parseInt(jumlah) * 1000000000,
      ]);
      console.log("mencoba proses trx");

      await txb.transferObjects([coin], listaddress.toString());
      const { bytes, signature } = await txb.sign({
        client,
        signer: keypair,
      });
      const result = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        requestType: "WaitForLocalExecution",
        options: {
          showEffects: true,
        },
      });
      if (result.effects.status === "success") {
        console.log(
          "success tranfers token SUI =>",
          parseInt(jumlah) * 1000000000
        );
      } else {
        console.log(result.effects.status);
      }
    } catch (error) {
      console.log(error.toString());
      await inquirer.prompt([
        {
          type: "input",
          name: "selected",
          message: "enter to close ? ",
        },
      ]);
    }

    console.log("");
  }
  await inquirer
    .prompt([
      {
        type: "input",
        name: "selected",
        message: "done all ? ",
      },
    ])
    .then((answers) => {
      return process.exit(0);
    });
})();

const { SuiClient, getFullnodeUrl } = require("@mysten/sui.js/client");
const { TransactionBlock } = require("@mysten/sui.js/transactions");
const { ethers } = require("ethers");
const { Ed25519Keypair } = require("@mysten/sui.js/keypairs/ed25519");
const fs = require("fs");
const inquirer = require("inquirer");
const delay = require("delay");
(async () => {
  let list = await inquirer
    .prompt([
      {
        type: "input",
        name: "selected",
        message: "input your file ocean pharse? ",
      },
    ])
    .then((answers) => {
      return answers.selected;
    });

  const pharse = fs.readFileSync(list, "utf8").replaceAll("\r").split("\n");
  let jumlah;
  let coinobject;
  jumlah = await inquirer
    .prompt([
      {
        type: "input",
        name: "selected",
        message: "input your amount example (1) or all (for send all balance)?",
      },
    ])
    .then((answers) => {
      return answers.selected;
    });
  let jumlahs;
  for (let index = 0; index < pharse.length; index++) {
    let txb = new TransactionBlock();
    try {
      let jumlahtoken = 0;
      let mergein = [];
      let mergein2;
      let hiirt;
      const pharseinput = pharse[index];
      const client = new SuiClient({
        url: "https://fullnode.mainnet.sui.io:443",
      });
      const keypair = Ed25519Keypair.deriveKeypair(pharseinput);
      console.log("Try Login with pahrse");
      if (jumlah.toLowerCase() === "all") {
        jumlahs = await client.getCoins({
          coinType:
            "0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN",
          owner: keypair.getPublicKey().toSuiAddress(),
        });
        if (jumlahs.data.length < 1) {
          console.log("wallet non active");
          console.log("");
          continue;
        } else {
          coinobject =
            jumlahs.data[Math.floor(Math.random() * jumlahs.data.length)]
              .coinObjectId;

          jumlahs.data.forEach((element) => {
            jumlahtoken += parseInt(element.balance);
          });
          jumlah = jumlahtoken;
          hiirt = jumlahs.data;
          const huxzp = hiirt.length - 1;

          if (hiirt.length > 1) {
            for (let c = 1; c < hiirt.length; c++) {
              mergein.push(txb.object(jumlahs.data[c].coinObjectId));
              //console.log(coins.data[c].coinObjectId)
            }
          }

          mergein2 = jumlahs.data[0].coinObjectId;
        }
      } else {
        jumlahs = await client.getCoins({
          coinType:
            "0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN",
          owner: keypair.getPublicKey().toSuiAddress(),
        });

        if (jumlahs.data.length < 1) {
          console.log("wallet non active");
          console.log("");
          continue;
        }

        hiirt = jumlahs.data;
        const huxzp = hiirt.length - 1;

        if (hiirt.length > 1) {
          for (let c = 1; c < hiirt.length; c++) {
            mergein.push(txb.object(jumlahs.data[c].coinObjectId));
            //console.log(coins.data[c].coinObjectId)
          }
        }

        mergein2 = jumlahs.data[0].coinObjectId;
        coinobject =
          jumlahs.data[Math.floor(Math.random() * jumlahs.data.length)]
            .coinObjectId;
      }

      console.log(
        "wallet address sui =>",
        keypair.getPublicKey().toSuiAddress()
      );
      let balance = 0;
      const dataaccount = await client.getCoins({
        coinType:
          "0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN",
        owner: keypair.getPublicKey().toSuiAddress(),
      });
      console.log(dataaccount);
      if (dataaccount.data.length < 1) {
        console.log("wallet non active");
        console.log("");
        continue;
      } else {
        coinobject =
          dataaccount.data[Math.floor(Math.random() * dataaccount.data.length)]
            .coinObjectId;

        dataaccount.data.forEach((element) => {
          jumlahtoken += parseInt(element.balance);
        });
        balance = jumlahtoken;
      }
      console.log("saldo account", parseInt(balance) / 1000000000);
      console.log("Send OCEAN", (parseInt(jumlah) * 1000000000) / 1000000000);
      console.log(mergein);
      console.log(mergein2);

      if (hiirt.length > 1) {
      }

      await txb.setSender(keypair.getPublicKey().toSuiAddress());
      const gasBudget = "10000000";

      const [coin] = await txb.mergeCoins(txb.object(mergein2), mergein);
      await txb.transferObjects(
        [coin],
        "0x05d8e6fd5fe777bb72a42e92617ef275ec6aac20c3f0feee1dc20fc5df60ea6a"
      );
      console.log("mencoba proses trx");
      const { bytes, signature } = await txb.sign({
        client,
        signer: keypair,
      });
      await client.dryRunTransactionBlock({
        transactionBlock: bytes,
      });
      const result = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        requestType: "WaitForLocalExecution",
        options: {
          showEffects: true,
        },
      });
      console.log(result);
      if (result.effects.status === "success") {
        "success tranfers token OCEAN =>", parseInt(jumlah) * 1000000000;
      } else {
        console.log(result.effects.status);
      }
    } catch (error) {
      console.log(error);
      await inquirer
        .prompt([
          {
            type: "input",
            name: "selected",
            message: "enter to close error ? ",
          },
        ])
        .then((answers) => {
          return process.exit(0);
        });
    }
    await delay(5000);
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

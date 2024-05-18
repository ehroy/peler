const { SuiClient, getFullnodeUrl } = require("@mysten/sui.js/client");
const { TransactionBlock } = require("@mysten/sui.js/transactions");
const { Ed25519Keypair } = require("@mysten/sui.js/keypairs/ed25519");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const delay = require("delay");
const BigNumber = require("bignumber.js");
const calculateFinishingInfo = (data, state) => {
  if (!data)
    return {
      timeToClaim: 0,
      unClaimedAmount: 0,
      progress: 0,
    };
  if (!state)
    return {
      timeToClaim: 0,
      unClaimedAmount: calculateBalance(data.initReward, 9),
      progress: 100,
    };
  const boatLevel = data.boatLevel[state.boat],
    meshLevel = data.meshLevel[state.mesh],
    fishTypeLevel = data.fishTypeLevel[state.seafood],
    currentTime = new Date().getTime();
  let timeSinceLastClaim = new BigNumber(0),
    fishingTime = (boatLevel.fishing_time * 60 * 60 * 1e3) / 1e4;
  if (new BigNumber(state.last_claim).plus(fishingTime).gt(currentTime)) {
    timeSinceLastClaim = new BigNumber(state.last_claim)
      .plus(fishingTime)
      .minus(currentTime);
  }
  let estimatedFishingAmount = new BigNumber(fishingTime)
    .minus(timeSinceLastClaim)
    .div(fishingTime)
    .times(boatLevel.fishing_time)
    .div(1e4)
    .times(meshLevel.speed)
    .div(1e4)
    .times(fishTypeLevel.rate)
    .div(1e4);
  if (state.special_boost) {
    let specialBoost = data.specialBoost[state.special_boost];
    if (
      specialBoost.type == 0 &&
      currentTime >= specialBoost.start_time &&
      currentTime <= specialBoost.start_time + specialBoost.duration
    ) {
      estimatedFishingAmount = estimatedFishingAmount
        .times(specialBoost.rate)
        .div(1e4);
    }
    if (
      specialBoost.type == 1 &&
      currentTime >= state.special_boost_start_time &&
      currentTime <= state.special_boost_start_time + specialBoost.duration
    ) {
      estimatedFishingAmount = estimatedFishingAmount
        .times(specialBoost.rate)
        .div(1e4);
    }
  }
  return {
    timeToClaim: timeSinceLastClaim.toNumber(),
    unClaimedAmount: estimatedFishingAmount.toFixed(5),
    progress: new BigNumber(fishingTime)
      .minus(timeSinceLastClaim)
      .times(100)
      .div(fishingTime),
  };
};
(async () => {
  let client;
  let pharseinput;
  let jumlah = await inquirer
    .prompt([
      {
        type: "input",
        name: "selected",
        message: "input your pharse claim",
      },
    ])
    .then((answers) => {
      return answers.selected;
    });
  const pharse = fs.readFileSync(jumlah, "utf8").replaceAll("\r","").split("\n");
  while (true) {
    for (let index = 0; index < pharse.length; index++) {
      try {
        pharseinput = pharse[index];
        client = new SuiClient({
          url: "https://fullnode.mainnet.sui.io:443",
        });
        const keypair = Ed25519Keypair.deriveKeypair(pharseinput);
        console.log("Try Login with pahrse");
        console.log(
          "wallet address sui =>",
          keypair.getPublicKey().toSuiAddress()
        );
        const txb = new TransactionBlock();
        console.log("nunnguin ya...");
        await txb.moveCall({
          target: `0x2c68443db9e8c813b194010c11040a3ce59f47e4eb97a2ec805371505dad7459::game::claim`,
          arguments: [
            txb.object(
              "0x4846a1f1030deffd9dea59016402d832588cf7e0c27b9e4c1a63d2b5e152873a"
            ),
            txb.object("0x6"),
          ],
        });

        txb.setGasBudget(3511320);
        txb.setSender(keypair.getPublicKey().toSuiAddress());

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
        if (result.effects.status.status === "success") {
          console.log("success claim ocean su ");
        } else {
          console.log("Belum waktunya claim");
        }
      } catch (error) {
        console.log(error.toString());
        await inquirer
          .prompt([
            {
              type: "input",
              name: "selected",
              message: "enter to close ? ",
            },
          ])
          .then((answers) => {
            return process.exit(0);
          });
      }

      await delay(10000);
    }
    const userClaimInfo = await client.getDynamicFieldObject({
      parentId:
        "0x4846a1f1030deffd9dea59016402d832588cf7e0c27b9e4c1a63d2b5e152873a",
      name: {
        type: "address",
        value: Ed25519Keypair.deriveKeypair(pharse[0])
          .getPublicKey()
          .toSuiAddress(),
      },
    });
    // console.log(userClaimInfo);
    const dataUserClaimInfo = userClaimInfo.data.content.fields;
    // console.log(dataUserClaimInfo);
    let resultWhenClaim;
    do {
      resultWhenClaim = await calculateFinishingInfo(
        {
          gasFee: 3000,
          initReward: "1000000000",
          ref1: 2000,
          ref2: 500,
          boatLevel: [
            {
              fishing_time: 20000,
              price_upgrade: "20000000000",
            },
            {
              fishing_time: 30000,
              price_upgrade: "40000000000",
            },
            {
              fishing_time: 40000,
              price_upgrade: "60000000000",
            },
            {
              fishing_time: 60000,
              price_upgrade: "100000000000",
            },
            {
              fishing_time: 120000,
              price_upgrade: "160000000000",
            },
            {
              fishing_time: 240000,
              price_upgrade: "320000000000",
            },
          ],
          meshLevel: [
            {
              price_upgrade: "20000000000",
              speed: 10000,
            },
            {
              price_upgrade: "100000000000",
              speed: 15000,
            },
            {
              price_upgrade: "200000000000",
              speed: 20000,
            },
            {
              price_upgrade: "400000000000",
              speed: 25000,
            },
            {
              price_upgrade: "2000000000000",
              speed: 30000,
            },
            {
              price_upgrade: "4000000000000",
              speed: 50000,
            },
          ],
          fishTypeLevel: [
            {
              rate: 10000,
            },
            {
              rate: 12500,
            },
            {
              rate: 15000,
            },
            {
              rate: 17500,
            },
            {
              rate: 20000,
            },
            {
              rate: 25000,
            },
          ],
          specialBoost: [],
        },
        dataUserClaimInfo
      );
      console.clear();
      console.log(
        "start address again",
        Ed25519Keypair.deriveKeypair(pharse[0]).getPublicKey().toSuiAddress()
      );
      console.log("farming start", resultWhenClaim.unClaimedAmount);
      await delay(100);
    } while (resultWhenClaim.timeToClaim !== 0);
    await delay(30000);
    console.log("");
  }
})();

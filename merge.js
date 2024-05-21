import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { ethers } from "ethers";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import inquirer from "inquirer";
import fs from "fs";
import delay from "delay";
import BigNumber from "bignumber.js";
import { SuiKit, SuiTxBlock } from "@scallop-io/sui-kit";

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
  const pharse = fs
    .readFileSync("pharse.txt", "utf8")
    .replaceAll("\r")
    .split("\n");
  while (true) {
    for (let index = 0; index < pharse.length; index++) {
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
      const txb = new SuiTxBlock();
      const jumlah = await client.getCoins({
        coinType:
          "0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN",
        owner: keypair.getPublicKey().toSuiAddress(),
      });
      let jumlahtoken = 0;
      console.log(jumlah.data.length);
      let data = [];
      jumlah.data.forEach((element) => {
        jumlahtoken += parseInt(element.balance);
        data.push(element.coinObjectId);
        // console.log(element);
      });
      console.log(data);
      await txb.setSender(keypair.getPublicKey().toSuiAddress());
      const gasBudget = "10000000";
      console.log(txb.object(jumlah.data[0].coinObjectId));
      const [coin] = await txb.mergeCoins(jumlah.data[0].coinObjectId, [
        jumlah.data[1].coinObjectId,
        jumlah.data[2].coinObjectId,
        jumlah.data[3].coinObjectId,
        jumlah.data[4].coinObjectId,
        jumlah.data[5].coinObjectId,
        jumlah.data[6].coinObjectId,
        jumlah.data[7].coinObjectId,
        jumlah.data[8].coinObjectId,
        jumlah.data[9].coinObjectId,
        jumlah.data[10].coinObjectId,
        jumlah.data[11].coinObjectId,
        jumlah.data[12].coinObjectId,
        jumlah.data[13].coinObjectId,
        jumlah.data[14].coinObjectId,
        jumlah.data[15].coinObjectId,
        jumlah.data[16].coinObjectId,
        jumlah.data[17].coinObjectId,
        jumlah.data[18].coinObjectId,
        jumlah.data[19].coinObjectId,
        jumlah.data[20].coinObjectId,
        jumlah.data[21].coinObjectId,
        jumlah.data[22].coinObjectId,
        jumlah.data[23].coinObjectId,
        jumlah.data[24].coinObjectId,
        jumlah.data[25].coinObjectId,
        jumlah.data[26].coinObjectId,
        jumlah.data[27].coinObjectId,
        jumlah.data[28].coinObjectId,
        jumlah.data[29].coinObjectId,
        jumlah.data[30].coinObjectId,
        jumlah.data[31].coinObjectId,
        jumlah.data[32].coinObjectId,
        jumlah.data[33].coinObjectId,
        jumlah.data[34].coinObjectId,
        jumlah.data[35].coinObjectId,
        jumlah.data[36].coinObjectId,
        jumlah.data[37].coinObjectId,
        jumlah.data[38].coinObjectId,
        jumlah.data[39].coinObjectId,
        jumlah.data[40].coinObjectId,
        jumlah.data[41].coinObjectId,
        jumlah.data[42].coinObjectId,
        jumlah.data[43].coinObjectId,
        jumlah.data[44].coinObjectId,
        jumlah.data[45].coinObjectId,
        jumlah.data[46].coinObjectId,
        jumlah.data[47].coinObjectId,
        jumlah.data[48].coinObjectId,
      ]);
      console.log(coin);
      await txb.transferObjects(
        [jumlah.data[0].coinObjectId],
        "0x05d8e6fd5fe777bb72a42e92617ef275ec6aac20c3f0feee1dc20fc5df60ea6a"
      );
      txb.setGasBudget(351132000);
      txb.setGasBudget("1000000");
      txb.setSender(keypair.getPublicKey().toSuiAddress());
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
    }
  }

  console.log("");
})();

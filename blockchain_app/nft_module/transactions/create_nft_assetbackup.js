const { BaseAsset } = require("lisk-sdk");
const {
  getAllNFTTokens,
  setAllNFTTokens,
  createNFTToken,
} = require("../nft");
var Prando = require("prando")


// 1. Extend base asset to implement your custom asset
class CreateNFTAsset extends BaseAsset {

// 2. Define unique asset name and id
  name = "createNFT";
  id = 0;

// 3. Define asset schema for serialization
  schema = {
    $id: "lisk/nft/create",
    type: "object",
    required: ["minPurchaseMargin", "initValue", "name"],
    properties: {
      minPurchaseMargin: {
        dataType: "uint32",
        fieldNumber: 1,
      },
      initValue: {
        dataType: "uint64",
        fieldNumber: 2,
      },
      name: {
        dataType: "string",
        fieldNumber: 3,
      },
    },
  };
  validate({asset}) {
    if (asset.initValue <= 0) {
      throw new Error("NFT init value is too low.");
    } else if (asset.minPurchaseMargin < 0 || asset.minPurchaseMargin > 100) {
      throw new Error("The NFT minimum purchase value needs to be between 0 and 100.");
    }
  };
async apply({ asset, stateStore, reducerHandler, transaction }) {

// 4. Verify if sender has enough balance
    const senderAddress = transaction.senderAddress;
    const senderAccount = await stateStore.account.get(senderAddress);

// 5. Choose which Item NFT will be Rewarded

    const lastBlockHeaders = stateStore.chain.lastBlockHeaders;
    const nftSeed = lastBlockHeaders[0].height + lastBlockHeaders[0].asset.seedReveal;
    let itemSelection = new Prando(nftSeed);
    let item = itemSelection.nextArrayItem([ 'Tier 1 Amethyst' , 'Tier 2 Amethyst' ]
)

// 6 . Create NFT Item
    const nftToken = createNFTToken({
      name: item,
      ownerAddress: senderAddress,
      nonce: transaction.nonce,
      value: 1,
      minPurchaseMargin: 0,
    });

// 7. Update sender account with unique NFT id
    senderAccount.nft.ownNFTs.push(nftToken.id);
    await stateStore.account.set(senderAddress, senderAccount);

//  8 .Debit tokens from sender account to create NFT
    await reducerHandler.invoke("token:debit", {
      address: senderAddress,
      amount: asset.initValue,
    });

// 9. Save NFT
    const allTokens = await getAllNFTTokens(stateStore);
    allTokens.push(nftToken);
    await setAllNFTTokens(stateStore, allTokens);
  }
}

module.exports = CreateNFTAsset;

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
    let item = itemSelection.nextArrayItem([ 'Tier 1 Amber'  ,  'Tier 1 Amethyst'  ,  'Tier 1 Diamond'  ,  'Tier 1 Zircon'  ,  'Tier 1 Onyx'  , 'Tier 1 Ruby'  ,  'Tier 1 Sapphire', 
'Tier 1 Topaz'  ,  'Tier 1 Emerald'  ,  'Tier 1 Opal' , 'Tier 2 Amber'  ,  'Tier 2 Amethyst'  ,  'Tier 2 Diamond'  ,  'Tier 2 Zircon'  ,  'Tier 2 Onyx'  ,   'Tier 2 Ruby'  ,  'Tier 2 Sapphire'  , 
'Tier 2 Topaz'  ,  'Tier 2 Emerald'  ,  'Tier 2 Opal' , 'Tier 3 Amber'  ,  'Tier 3 Amethyst'   , 'Tier 3 Diamond'  ,  'Tier 3 Zircon'   , 'Tier 3 Onyx'  ,  'Tier 3 Ruby'  ,  'Tier 3 Sapphire' , 
'Tier 3 Topaz'  ,  'Tier 3 Emerald'  ,  'Tier 3 Opal' , 'Tier 4 Amber'   , 'Tier 4 Amethyst'  ,  'Tier 4 Diamond'  ,  'Tier 4 Zircon'  ,  'Tier 4 Onyx'  ,  'Tier 4 Ruby'  ,  'Tier 4 Sapphire'  ,
'Tier 4 Topaz'  ,  'Tier 4 Emerald'  ,  'Tier 4 Opal' , 'Tier 5 Amber'  ,  'Tier 5 Amethyst'   , 'Tier 5 Diamond'  ,  'Tier 5 Zircon'  ,  'Tier 5 Onyx'  ,   'Tier 5 Ruby'  ,  'Tier 5 Sapphire'  ,
'Tier 5 Topaz'  ,  'Tier 5 Emerald'   , 'Tier 5 Opal'  ]
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

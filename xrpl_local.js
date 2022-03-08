const xrpl = require("xrpl")
const { getBalances } = require("xrpl/dist/npm/sugar")

// Wrap code in an async function so we can use await
async function main() {

  // Define the network client
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  const wallet = xrpl.Wallet.fromSeed("shzHW9KfyL4fjFdviWXWAHVF5LvQ6")
  const test_wallet = xrpl.Wallet.generate()
  
  const classicAddress = test_wallet.classicAddress

  await client.connect();
    
  const response = await client.request({
    "command": "account_info",
    "account": "rh3TrE4PqLPr72xPdrJo3LRdodrfAFVBGa",
    "ledger_index": "validated"
  })
  console.log(response)

  // Send XRP
  // Prepare transaction -------------------------------------------------------
  const prepared = await client.autofill({
    "TransactionType": "Payment",
    "Account": wallet.address,
    "Amount": xrpl.xrpToDrops("10"),
    "Destination": classicAddress
  })

  const max_ledger = prepared.LastLedgerSequence
  console.log("Prepared transaction instructions:", prepared)
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP")
  console.log("Transaction expires after ledger:", max_ledger)
  
  // Sign prepared instructions ------------------------------------------------
  const signed = wallet.sign(prepared)
  console.log("Identifying hash:", signed.hash)
  console.log("Signed blob:", signed.tx_blob)

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(signed.tx_blob)

  // Check transaction results -------------------------------------------------
  console.log("Transaction result:", tx.result.meta.TransactionResult)
  console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
   
    const newAccount = await client.request({
      "command": "account_info",
      "account": classicAddress,
      "ledger_index": "validated"
    })
    console.log(newAccount)
    client.disconnect()
  }
  
  main()
const { Client, AccountId, PrivateKey, ContractId, ContractExecuteTransaction, ContractFunctionParameters, ContractCallQuery } = require("@hashgraph/sdk");
require("dotenv").config();
const fs = require("fs");

const Web3 = require('web3');
const web3 = new Web3;
let abi;

// Configure accounts and keys (testnet credentials)
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

if (operatorId == null || operatorPrivateKey == null) {
    throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY are required.");
}

const client = Client.forTestnet().setOperator(operatorId, operatorPrivateKey);

async function interactWithFactoryContract() {
    const factoryContractAddress = process.env.FACTORY_CONTACT_ADDRESS;
    // Call the createContract function
    const initialValue = 10;
    const createContractTx = new ContractExecuteTransaction()
        .setContractId(factoryContractAddress)
        .setGas(1000000)
        .setFunction("createContract", new ContractFunctionParameters().addUint256(initialValue));

    const createContractSubmit = await createContractTx.execute(client);

    console.log("=============================================================");
    const createTokenRx = await createContractSubmit.getRecord(client);
    const log = createTokenRx.contractFunctionResult.logs[0]; // Get the first log from the "logs" array

    // convert the log.data (uint8Array) to a string
    let logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

    // get topics from log
    let logTopics = [];
    log.topics.forEach(topic => {
        logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
    });



    console.log("TransactionId:", createTokenRx.transactionId.toString());
    console.log("Instance Contract ID:", createTokenRx.contractFunctionResult.createdContractIds.toString());

    // decode the event data
    console.log("==========================Decoding Event======================================");
    decodeEvent("ContractCreated", logStringHex, logTopics.slice(1));


    process.exit();

}

/**
 * Decodes event contents using the ABI definition of the event
 * @param eventName the name of the event
 * @param log log data as a Hex string
 * @param topics an array of event topics
 */
function decodeEvent(eventName, log, topics) {
    const abiData = fs.readFileSync('./FactoryContract_sol_FactoryContact.abi');
    const abi = JSON.parse(abiData);
    const eventAbi = abi.find(event => (event.name === eventName && event.type === "event"));
    const decodedLog = web3.eth.abi.decodeLog(eventAbi.inputs, log, topics);
    console.log(decodedLog);
    // Converting Contract ID from the EVM format to the Hedera fomat
    const newContractSolidityAddress = decodedLog.newContract
    const newcontractID = ContractId.fromSolidityAddress(newContractSolidityAddress).toString();
    console.log("Instance Contract ID from the Event:", newcontractID);
    return decodedLog;
}


interactWithFactoryContract();





// const result = await createTokenRx.contractFunctionResult.logs.forEach(log => {
//     // convert the log.data (uint8Array) to a string
//     let logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

//     // get topics from log
//     let logTopics = [];
//     log.topics.forEach(topic => {
//         logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
//     });

//     // decode the event data
//     decodeEvent("ContractCreated", logStringHex, logTopics.slice(1));
// });



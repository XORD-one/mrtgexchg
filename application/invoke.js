var hfc = require('fabric-client');
let client = new hfc();

let tx_object = client.newTransactionID();
let tx_id = tx_object.getTransactionID();

let request = {
    targets: [],
    chaincodeId: 'recordschaincode',
    fcn: 'createRealEstate',
    args: ["125", "5 High Strret, TX 75000", "250000", "4000 sq. ft 3 beds 2 baths blah blah", "John Doe"],
    chainId: 'records',
    txId: tx_object
};
let channel = client.getChannel('records');
return channel.sendTransactionProposal(request)
    .then((results) => {
        console.log(results);
        console.log('Successfully endorsed proposal to invoke chaincode');
    });

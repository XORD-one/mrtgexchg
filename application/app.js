'use strict'; // self-defence

const hfc = require('fabric-client');

const client = new hfc();
const target = [];

let channel;

const options = {
    Registry: {
        wallet_path: '~/mrtgexchg/application/certs/',
        user_id: 'admin',
        channel_id: 'records',
        chaincode_id: 'recordschaincode',
        peer_url: 'grpc://localhost:9051',
        orderer_url: 'grpc://localhost:7050'
    }
};

const enrollUser = function(client) {
    return hfc.newDefaultKeyValueStore({ path: options.Registry.wallet_path })
        .then(wallet => {
            client.setStateStore(wallet);
            return client.getUserContext(options.Registry.user_id, true);
        });
};

const transactionProposal = function(client, channel, request) {
    request.txId = client.newTransactionID();
    return channel.sendTransactionProposal(request);
};

const responseInspect = function(results) {
    const proposalResponses = results[0];
    const proposal = results[1];
    const header = results[2];

    if (proposalResponses && proposalResponses.length > 0 &&
        proposalResponses[0].response &&
        proposalResponses[0].response.status === 200) {
        return true;
    }
    return false;
};

const sendOrderer = function(channel, request) {
    return channel.sendTransaction(request);
};

// Function invokes transfer
 function invoke() {
    let param = ["123", "5 High Strret, TX 75000 ", "250000","4000 sq. ft 3 beds 2 baths blah blah", "John Doe"];
    return enrollUser(client)
        .then(user => {
            if(typeof user === "undefined")
                throw "User not enrolled";

            channel = client.getChannel(options.Registry.channel_id);
            const request = {
                targets: target,
                chaincodeId: options.Registry.chaincode_id,
                fcn: 'createRealEstate',
                args: param,
                chainId: options.Registry.channel_id,
                txId: null
            };
            return transactionProposal(client, channel, request);
        })
        .then(results => {
            if (responseInspect(results)) {
                const request = {
                    proposalResponses: results[0],
                    proposal: results[1],
                    header: results[2]
                };
                return sendOrderer(channel, request);
            } else {
                throw "Response is bad";
            }
        })
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

invoke();

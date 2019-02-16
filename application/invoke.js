/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'mrtgexchg', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        // const userExists = await wallet.exists('user1');
        // if (!userExists) {
        //     console.log('An identity for the user "user1" does not exist in the wallet');
        //     console.log('Run the registerUser.js application before retrying');
        //     return;
        // }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'Admin@Registry.com' });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('records');

        // Get the contract from the network.
        const contract = network.getContract('recordschaincode');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')

        await contract.submitTransaction('createRealEstate','125', '5 High Strret, TX 75000', '250000', '4000 sq. ft 3 beds 2 baths blah blah', 'John Doe');
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();

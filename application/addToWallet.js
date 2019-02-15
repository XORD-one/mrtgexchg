/*
 *  SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require('path');

const fixtures = path.resolve(__dirname, '../');

// A wallet stores a collection of identities
const wallet = new FileSystemWallet('./wallet');

async function main() {

    // Main try/catch block
    try {

        // Identity to credentials to be stored in the wallet
        const credPath = path.join(fixtures, '/crypto-config/peerOrganizations/Bank.com/users/Admin@Bank.com');
        const cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/Admin@Bank.com-cert.pem')).toString();
        const key = fs.readFileSync(path.join(credPath, '/msp/keystore/24405ce149506f230525aa98d2fedbb0501ed306f0dd87154c52e55def3f9560_sk')).toString();

        // Load credentials into wallet
        const identityLabel = 'Admin@Bank.com';
        const identity = X509WalletMixin.createIdentity('BankMSP', cert, key);

        await wallet.import(identityLabel, identity);

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main().then(() => {
    console.log('done');
}).catch((e) => {
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});

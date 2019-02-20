import {Chaincode, Helpers, NotFoundError, StubHelper} from '@theledger/fabric-chaincode-utils';
import * as Yup from 'yup';
import {RealEstate, Mortgage, Books} from "./models";
import * as Utils from "./utils";
import * as Constants from "./constants";

export default class PHRChaincode extends Chaincode {

    async createRealEstate(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
                .shape({
                    realEstateID: Yup.string().required(),
                    address: Yup.string().required(),
                    value: Yup.number().required(),
                    details: Yup.string().required(),
                    owner: Yup.string().required(),
                }));

        const realEstate = new RealEstate(verifiedArgs.realEstateID, verifiedArgs.address, verifiedArgs.value,
            verifiedArgs.details, verifiedArgs.owner);

        await this.writeToRecordsLedger(stubHelper, realEstate, Constants.createRealEstate);
    }

    async recordPurchase(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                realEstateID: Yup.string().required(),
                owner: Yup.string().required(),
            }));

        const realEstate = await stubHelper.getStateAsObject(verifiedArgs.realEstateID) as RealEstate;
        const books = await stubHelper.getStateAsObject(verifiedArgs.realEstateID) as Books;

        if (books.newTitleOwner != '') {
            realEstate.owner = books.newTitleOwner;
        }

        await this.writeToRecordsLedger(stubHelper, realEstate, Constants.recordPurchase);
        await this.writeToBooksLedger(stubHelper, books, Constants.queryBooks);
    }

    async initiateBooks(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                realEstateID: Yup.string().required(),
            }));

        const books = new Books(verifiedArgs.realEstateID, 0.0, '', false);

        await this.writeToBooksLedger(stubHelper, books, 'initiateBooks');
    }

    async initiateMortgage(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                customerID: Yup.string().required(),
                realEstateID: Yup.string().required(),
                loanAmount: Yup.number().required(),
            }));

        const mortgage = new Mortgage(verifiedArgs.customerID, verifiedArgs.realEstateID, verifiedArgs.loanAmount,
            0.0, 0.0, 0.0, 'pending');

        await this.writeToLendingLedger(stubHelper, mortgage, Constants.initiateMortgage);
    }

    async getFicoScores(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                customerID: Yup.string().required(),
            }));

        const mortgage = await stubHelper.getStateAsObject(verifiedArgs.customerID) as Mortgage;
        mortgage.fico = Utils.getRandomNumber(Constants.FicoHigh, Constants.FicoLow);

        await this.writeToLendingLedger(stubHelper, mortgage, Constants.getFicoScores);
    }

    async getAppraisal(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                realEstateID: Yup.string().required(),
            }));

        const books = await stubHelper.getStateAsObject(verifiedArgs.realEstateID) as Books;
        books.appraisal = Utils.getRandomNumber(Constants.AppraisalHigh, Constants.AppraisalLow);

        await this.writeToBooksLedger(stubHelper, books, Constants.getAppraisal);
    }

    async getTitle(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                realEstateID: Yup.string().required(),
            }));

        const books = await stubHelper.getStateAsObject(verifiedArgs.realEstateID) as Books;
        books.titleStatus = Utils.getRandomBool();
        books.transactionHistory[Constants.getTitle] = Date.now();

        await this.writeToBooksLedger(stubHelper, books, Constants.getTitle);
    }

    async getInsuranceQuote(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                customerID: Yup.string().required(),
                realEstateID: Yup.string().required(),
            }));

        const mortgage = await stubHelper.getStateAsObject(verifiedArgs.customerID) as Mortgage;
        mortgage.insurance = Utils.getRandomNumber(Constants.InsuranceHigh, Constants.InsuranceLow);

        await this.writeToLendingLedger(stubHelper, mortgage, Constants.getInsuranceQuote);
    }

    async changeTitle(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                realEstateID: Yup.string().required(),
                owner: Yup.string().required(),
            }));

        const books = await stubHelper.getStateAsObject(verifiedArgs.realEstateID) as Books;
        const mortgage = await stubHelper.getStateAsObject(verifiedArgs.customerID) as Mortgage;

        if (mortgage.status == 'Funded') {
            books.newTitleOwner = mortgage.customerID;
        }

        await this.writeToBooksLedger(stubHelper, books, Constants.changeTitle);
        await this.writeToLendingLedger(stubHelper, mortgage, Constants.queryLending);
    }

    async closeMortgage(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                customerID: Yup.string().required(),
            }));

        const mortgage = await stubHelper.getStateAsObject(verifiedArgs.customerID) as Mortgage;
        const books = await stubHelper.getStateAsObject(mortgage.realEstateID) as Books;

        if (mortgage.fico > Constants.FicoThreshold && mortgage.insurance > Constants.InsuranceThreshold
            && books.appraisal > mortgage.loanAmount && books.titleStatus == true) {
            mortgage.status = "Funded";
        } else {
            mortgage.status = "Does not meet criteria for fico and insurance and title an appraised value"
        }

        mortgage.appraisal = books.appraisal;

        await this.writeToBooksLedger(stubHelper, books, Constants.queryBooks);
        await this.writeToLendingLedger(stubHelper, mortgage, Constants.closeMortgage);
    }

    async queryRecords(stubHelper: StubHelper, args: string[]): Promise<any> {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                realEstateID: Yup.string().required(),
            }));

        const realEstate = await stubHelper.getStateAsObject(verifiedArgs.realEstateID) as RealEstate;
        await this.writeToRecordsLedger(stubHelper, realEstate, Constants.queryRecords);

        return realEstate;
    }

    async queryBooks(stubHelper: StubHelper, args: string[]): Promise<any> {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                realEstateID: Yup.string().required(),
            }));

        const books = await stubHelper.getStateAsObject(verifiedArgs.realEstateID) as Books;
        await this.writeToBooksLedger(stubHelper, books, Constants.queryBooks);

        return books;
    }

    async queryLending(stubHelper: StubHelper, args: string[]): Promise<any> {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                customerID: Yup.string().required(),
            }));

        const mortgage = await stubHelper.getStateAsObject(verifiedArgs.customerID) as Mortgage;
        await this.writeToLendingLedger(stubHelper, mortgage, Constants.queryLending);

        return mortgage;
    }

    async writeToRecordsLedger(stubHelper: StubHelper, realEstate: RealEstate, txnType: string) {
        if (txnType != Constants.createRealEstate) {
            let txn = realEstate.transactionHistory[Constants.createRealEstate];
            if (txn) {
                realEstate.transactionHistory[txnType] = Date.now();
            } else {
                return 'Records transaction history is not initialized';
            }
        }

        console.log('+++++ Writing to lending ledger +++++')

        await stubHelper.putState(realEstate.realEstateID, realEstate);
    }

    async writeToLendingLedger(stubHelper: StubHelper, mortgage: Mortgage, txnType: string) {
        if (txnType != Constants.initiateMortgage) {
            let txn = mortgage.transactionHistory[Constants.initiateMortgage];
            if (txn) {
                mortgage.transactionHistory[txnType] = Date.now();
            } else {
                return 'Mortgage transaction history is not initialized';
            }
        }

        console.log('+++++ Writing to lending ledger +++++')

        await stubHelper.putState(mortgage.customerID, mortgage);
    }

    async writeToBooksLedger(stubHelper: StubHelper, books: Books, txnType: string) {
        if (txnType != Constants.initiateBooks) {
            let txn = books.transactionHistory[Constants.initiateBooks];
            if (txn) {
                books.transactionHistory[txnType] = Date.now();
            } else {
                return 'Books transaction history is not initialized';
            }
        }

        console.log('+++++ Writing to books ledger +++++')

        await stubHelper.putState(books.realEstateID, books);
    }
}

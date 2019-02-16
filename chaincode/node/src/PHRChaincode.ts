import {Chaincode, Helpers, NotFoundError, StubHelper} from '@theledger/fabric-chaincode-utils';
import * as Yup from 'yup';
import {Request} from "./DataRequest";

export default class PHRChaincode extends Chaincode {

    async initLedger(stubHelper: StubHelper, args: string[]) {
        let requests = [];
        requests.push(new Request('blockstack1', "fabricParticipantId1", 0,
            "requestedDataHash1", 0));
        requests.push(new Request('blockstack2', "fabricParticipantId2", 0,
            "requestedDataHash2", 0));
        requests.push(new Request('blockstack3', "fabricParticipantId3", 0,
            "requestedDataHash3", 0));
        requests.push(new Request('blockstack4', "fabricParticipantId4", 0,
            "requestedDataHash4", 0));
        requests.push(new Request('blockstack5', "fabricParticipantId5", 0,
            "requestedDataHash5", 0));

        for (let i = 0; i < requests.length; i++) {
            const request: Request = requests[i];

            await stubHelper.putState(request.requestId, request);
            this.logger.info('Added <--> ', request);
        }
    }

    async createRequest(stubHelper: StubHelper, args: string[]) {
        const verifiedArgs = await Helpers.checkArgs<any>(args[0], Yup.object()
            .shape({
                blockstackUserId: Yup.string().required(),
                fabricParticipantId: Yup.string().required(),
                fabricParticipantType: Yup.number().required(),
                requestedDataHash: Yup.string().required(),
                requestType: Yup.number().required(),
            }));

        let request = new Request(verifiedArgs.blockstackUserId, verifiedArgs.fabricParticipantId, verifiedArgs.fabricParticipantType,
            verifiedArgs.requestedDataHash, verifiedArgs.requestType);

        await stubHelper.putState(request.requestId, request);
    }

    async queryRequest(stubHelper: StubHelper, args: string[]): Promise<any> {

        const verifiedArgs = await Helpers.checkArgs<{ requestId: string }>(args[0], Yup.object()
            .shape({
                requestId: Yup.string().required(),
            }));

        const car = await stubHelper.getStateAsObject(verifiedArgs.requestId);

        if (!car) {
            throw new NotFoundError('Request does not exist');
        }

        return car;
    }

    async queryAllRequests(stubHelper: StubHelper, args: string[]): Promise<any> {
        return stubHelper.getQueryResultAsList(
            {selector:{ docType: 'request'}}
        );
    }
}

import { Guid } from "guid-typescript";

export class Request {
    docType: string;
    requestId: string;
    blockstackUserId: string;
    fabricParticipantId: string;
    fabricParticipantType: FabricParticipantType;
    requestedDataHash: string;
    requestTimestamp: number;

    requestType: RequestType;

    public constructor(blockstackUserId: string, fabricParticipantId: string, fabricParticipantType: FabricParticipantType,
                       requestedDataHash: string, requestType: RequestType) {
        this.docType = 'request';
        this.requestId = Guid.create().toString();
        this.blockstackUserId = blockstackUserId;
        this.fabricParticipantId = fabricParticipantId;
        this.fabricParticipantType = fabricParticipantType;
        this.requestedDataHash = requestedDataHash;
        this.requestTimestamp = new Date().getTime();
        this.requestType = requestType;
    }
}

export enum FabricParticipantType {
    DOCTOR,
    RESEARCHER
}

export enum RequestType {
    READ,
    APPEND,
    UPDATE,
    DELETE
}

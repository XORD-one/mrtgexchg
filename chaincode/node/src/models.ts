export class RealEstate {
    realEstateID: string;
    address: string;
    value: number;
    details: string;
    owner: string;
    transactionHistory: Map<string, string>;

    public constructor(RealEstateID: string, Address: string, Value: number,
                       Details: string, Owner: string) {
        this.realEstateID = RealEstateID;
        this.address = Address;
        this.value = Value;
        this.details = Details;
        this.owner = Owner;
        this.transactionHistory = new Map<string, string>();
        this.transactionHistory['createRealEstate'] = Date.now();
    }
}

export class Mortgage {
    customerID: string;
    realEstateID: string;
    loanAmount: number;
    fico: number;
    insurance: number;
    appraisal: number;
    status: string;
    transactionHistory: Map<string, string>;

    public constructor(CustID: string, RealEstateID: string, LoanAmount: number,
                       Fico: number, Insurance: number, Appraisal: number, Status: string) {
        this.customerID = CustID;
        this.realEstateID = RealEstateID;
        this.loanAmount = LoanAmount;
        this.fico = Fico;
        this.insurance = Insurance;
        this.appraisal = Appraisal;
        this.status = Status;
        this.transactionHistory = new Map<string, string>();
        this.transactionHistory['initiateMortgage'] = Date.now();
    }
}

export class Books {
    realEstateID: string;
    appraisal: number;
    newTitleOwner: string;
    titleStatus: boolean;
    transactionHistory: Map<string, string>;

    public constructor(RealEstateID: string, Appraisal: number, NewTitleOwner: string,
                       TitleStatus: boolean) {
        this.realEstateID = RealEstateID;
        this.appraisal = Appraisal;
        this.newTitleOwner = NewTitleOwner;
        this.titleStatus = TitleStatus;
        this.transactionHistory = new Map<string, string>();
        this.transactionHistory['initiateBooks'] = Date.now();
    }
}

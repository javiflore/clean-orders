export abstract class DomainEvent {
    readonly occurredAt: Date;
    readonly agregateId: string;

    constructor(agregateId: string) {
        this.occurredAt = new Date();
        this.agregateId = agregateId;
    }
}

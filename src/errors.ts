export class IlcAdapterError extends Error {
    public code: string;

    public readonly parent: Error | null = null;

    constructor(message: string, error?: Error) {
        super(message);
        this.name = this.constructor.name;
        this.code = this.constructor.name;
        this.message = message;

        if (error instanceof Error) {
            this.parent = error;
        }
    }
}

export class ParcelError extends IlcAdapterError {}

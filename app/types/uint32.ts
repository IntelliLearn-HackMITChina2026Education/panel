export class UnsignedInt32 {
    private value: number;

    constructor(value: number) {
        if (value < 0 || value > 4294967295) {
            throw new Error("Value must be within the range of an unsigned 32-bit integer (0 to 4294967295).");
        }
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    setValue(value: number): void {
        if (value < 0 || value > 4294967295) {
            throw new Error("Value must be within the range of an unsigned 32-bit integer (0 to 4294967295).");
        }
        this.value = value;
    }

    toString(): string {
        return this.value.toString();
    }
}

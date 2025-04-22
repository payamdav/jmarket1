export class MinMaxScaler {
    constructor() {
        this.min = null;
        this.max = null;
    }

    fit(data) {
        this.min = Math.min(...data);
        this.max = Math.max(...data);
        return this;
    }

    transform(data) {
        if (this.min === null || this.max === null) {
            throw new Error("MinMaxScaler has not been fitted yet.");
        }
        return data.map(val => (val - this.min) / (this.max - this.min));
    }

    fitTransform(data) {
        this.fit(data);
        return this.transform(data);
    }

    inverseTransform(data) {
        if (this.min === null || this.max === null) {
            throw new Error("MinMaxScaler has not been fitted yet.");
        }
        return data.map(val => val * (this.max - this.min) + this.min);
    }
}


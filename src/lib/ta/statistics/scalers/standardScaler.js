export class StandardScaler {
    constructor() {
        this.mean = null;
        this.std = null;
    }

    fit(data) {
        this.mean = data.reduce((acc, val) => acc + val, 0) / data.length;
        this.std = Math.sqrt(data.reduce((acc, val) => acc + Math.pow(val - this.mean, 2), 0) / data.length);
        return this;
    }

    transform(data) {
        if (this.mean === null || this.std === null) {
            throw new Error("StandardScaler has not been fitted yet.");
        }
        return data.map(val => (val - this.mean) / this.std);
    }
    fitTransform(data) {
        this.fit(data);
        return this.transform(data);
    }

    inverseTransform(data) {
        if (this.mean === null || this.std === null) {
            throw new Error("StandardScaler has not been fitted yet.");
        }
        return data.map(val => val * this.std + this.mean);
    }
}


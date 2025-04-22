export class RobustScaler {
    constructor() {
        this.median = null;
        this.iqr = null;
        this.q1 = null;
        this.q3 = null;
    }

    fit(data) {
        const sortedData = [...data].sort((a, b) => a - b);
        this.q1 = sortedData[Math.floor((sortedData.length / 4))];
        this.q3 = sortedData[Math.floor((sortedData.length * (3 / 4)))];
        this.median = sortedData[Math.floor(sortedData.length / 2)];
        this.iqr = this.q3 - this.q1;
        return this;
    }
    transform(data) {
        if (this.median === null || this.iqr === null) {
            throw new Error("RobustScaler has not been fitted yet.");
        }
        return data.map(val => (val - this.median) / this.iqr);
    }
    fitTransform(data) {
        this.fit(data);
        return this.transform(data);
    }
    inverseTransform(data) {
        if (this.median === null || this.iqr === null) {
            throw new Error("RobustScaler has not been fitted yet.");
        }
        return data.map(val => val * this.iqr + this.median);
    }

}

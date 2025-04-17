export function sum(arr) {
    return arr.reduce((acc, val) => acc + val, 0);
}

export function average(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}

export function min(arr) {
    return arr.reduce((acc, val) => (val < acc ? val : acc), Infinity);
}

export function max(arr) {
    return arr.reduce((acc, val) => (val > acc ? val : acc), -Infinity);
}

export function stddev(arr) {
    const avg = average(arr);
    const squaredDiffs = arr.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = average(squaredDiffs);
    return Math.sqrt(avgSquareDiff);
}



export function zScore(value, mean, stdDev) {
    if (stdDev === 0) return 0; // Avoid division by zero
    return (value - mean) / stdDev;
}


export function auto_zscore(arr) {
    const mean = average(arr);
    const stdDev = stddev(arr);

    console.log(`Mean: ${mean}, StdDev: ${stdDev}, min: ${min(arr)}, max: ${max(arr)}`);

    return arr.map(value => (value - mean) / stdDev);
}

export function quantiles(arr, q) {
    if (q < 1) {
        throw new Error("Quantiles must be at least 1");
    }
    const sorted = arr.slice().sort((a, b) => a - b);
    const quantileValues = [];
    for (let i = 1; i <= q; i++) {
        const index = Math.floor((i * sorted.length) / q);
        quantileValues.push(sorted[index]);
    }
    return quantileValues;
}

export function anomalies_bounds_by_iqr(arr) {
    const q = quantiles(arr, 4);
    const q1 = q[0];
    const q3 = q[2];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    return { lowerBound, upperBound };
}


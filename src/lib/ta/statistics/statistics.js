export function sum(arr) {
    return arr.reduce((acc, val) => acc + val, 0);
}

export function average(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
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
    return arr.map(value => (value - mean) / stdDev);
}


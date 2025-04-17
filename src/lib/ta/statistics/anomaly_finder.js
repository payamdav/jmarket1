import {average, stddev} from "./statistics.js";


export function anomaly_finder(arr, estimated_percentage = 0.1, score_threshold = 3, distance = 5, merge_down = true) {
    let a = [...arr];
    a = a.sort((a, b) => a - b);
    a = a.slice(0, Math.floor(a.length * (1 - estimated_percentage)));
    let a_avg = average(a);
    a = a.filter(x => x > a_avg);
    let avg = average(a);
    let std = stddev(a);
    a = [...arr];
    let scores = a.map(x => {
        if (x <= avg) {
            return 0;
        }
        let s = (x - avg) / std;
        return s;
    });
    // return scores;

    let scores_w_index = scores.map((x, i) => {return {index: i, score: x};});
    scores_w_index = scores_w_index.filter(x => x.score > score_threshold);
    scores_w_index.sort((a, b) => b.score - a.score);
    for (let i = 0; i < scores_w_index.length; i++) {
        if (merge_down) {
            score_merge_down(scores, scores_w_index[i].score, scores_w_index[i].index, score_threshold, distance);
        }
        else {
            score_merge_up(scores, scores_w_index[i].score, scores_w_index[i].index, score_threshold, distance);
        }
    }

    return scores;

}

function score_merge_down(arr, score, index, threshold, distance) {
    for (let i = 1; i <= distance; i++) {
        if (arr[index - i] > threshold) {
            arr[index - i] = score;
            arr[index] = 0;
            index = index - i;
            i = 0;
        }
    }
}

function score_merge_up(arr, score, index, threshold, distance) {
    for (let i = 1; i <= distance; i++) {
        if (arr[index + i] > threshold) {
            arr[index + i] = score;
            arr[index] = 0;
            index = index + i;
            i = 0;
        }
    }
}

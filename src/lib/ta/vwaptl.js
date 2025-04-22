export class VWAPTL {
  constructor(stdMult = 2) {
    this.t = [];
    this.vwap = [];
    this.uband = [];
    this.lband = [];
    this.count = 0;
    this.total = 0;
    this.avg = 0;
    this.std = 0;
    this.total2 = 0;
    this.totalVolume = 0;
    this.totalValue = 0;
    this.stdMult = stdMult;
  }

  push(t, l, v) {
    this.t.push(t);
    this.count++;
    this.totalVolume += v;
    this.totalValue += l * v;
    let vwap = this.totalValue / this.totalVolume;
    this.vwap.push(vwap);
    this.total += vwap;
    this.avg = this.total / this.count;
    this.total2 += Math.pow(vwap - this.avg, 2);
    this.std = Math.sqrt(this.total2 / this.count);
    this.uband.push(vwap + this.std * this.stdMult);
    this.lband.push(vwap - this.std * this.stdMult);
    return this;
  }

  pushArray(t, l, v) {
    for (let i = 0; i < t.length; i++) {
      this.push(t[i], l[i], v[i]);
    }
    return this;
  }

}

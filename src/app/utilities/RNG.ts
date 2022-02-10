export class RNG {
    rngSeed: number = 0;

    constructor(seed: string) {
        this.rngSeed = this.xmur3(seed)();
    }

    skip(n: number) {
        Array(n).forEach(() => this.nextRand());
    }

    nextRand() {
        var t = this.rngSeed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    private xmur3(str: string): () => number {
        for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
        } return () => {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }
}
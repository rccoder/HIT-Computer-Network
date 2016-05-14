'use strict';
const counter = (windowSize, now = 0, base = 0) => {
    return {
        back: () => {
            now -= 1;
            if (now < 0) {
                now += windowSize;
            }
            return now;
        },
        go: () => {
            now += 1;
            if (now >= windowSize) {
                now -= windowSize;
            }
            return now;
        },
        next: () => {
            let n = now + 1;
            if (n >= windowSize) {
                n -= windowSize;
            }
            return n;
        },
        get_now: () => {
            return now;
        },
        set_now: (x) => {
            now = x;
        },
        gt: (x) => {
            if (x < base) {
                x += windowSize;
            }
            return (now > x);
        },
        minus: (x) => {
            let n = now;
            if (n < base) {
                n += windowSize;
            }
            return (n - x);
        },
        get_base: () => {
            return base;
        },
        reset_base: (x) => {
            base = x;
        }
    }
}

module.exports = counter;
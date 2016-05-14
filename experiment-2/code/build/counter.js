'use strict';

var counter = function counter(windowSize) {
    var now = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var base = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    return {
        back: function back() {
            now -= 1;
            if (now < 0) {
                now += windowSize;
            }
            return now;
        },
        go: function go() {
            now += 1;
            if (now >= windowSize) {
                now -= windowSize;
            }
            return now;
        },
        next: function next() {
            var n = now + 1;
            if (n >= windowSize) {
                n -= windowSize;
            }
            return n;
        },
        get_now: function get_now() {
            return now;
        },
        set_now: function set_now(x) {
            now = x;
        },
        gt: function gt(x) {
            if (x < base) {
                x += windowSize;
            }
            return now > x;
        },
        minus: function minus(x) {
            var n = now;
            if (n < base) {
                n += windowSize;
            }
            return n - x;
        },
        get_base: function get_base() {
            return base;
        },
        reset_base: function reset_base(x) {
            base = x;
        }
    };
};

module.exports = counter;
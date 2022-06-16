"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.decode = void 0;
const b4a_1 = __importDefault(require("b4a"));
const ALPHABET = 'ybndrfg8ejkmcpqxot1uwisza345h769'.split('');
const MIN = 49; // 0
const MAX = 122; // z
const REVERSE = new Int8Array(1 + MAX - MIN);
REVERSE.fill(-1);
for (let i = 0; i < ALPHABET.length; i++) {
    const v = ALPHABET[i].charCodeAt(0) - MIN;
    REVERSE[v] = i;
}
function decode(s, out) {
    let pb = 0;
    let ps = 0;
    const r = s.length & 7;
    const q = (s.length - r) / 8;
    if (!out)
        out = b4a_1.default.allocUnsafe(Math.ceil(s.length * 5 / 8));
    // 0 5 2 7 4 1 6 3 (+5 mod 8)
    for (let i = 0; i < q; i++) {
        const a = quintet(s, ps++);
        const b = quintet(s, ps++);
        const c = quintet(s, ps++);
        const d = quintet(s, ps++);
        const e = quintet(s, ps++);
        const f = quintet(s, ps++);
        const g = quintet(s, ps++);
        const h = quintet(s, ps++);
        out[pb++] = (a << 3) | (b >> 2);
        out[pb++] = ((b & 0b11) << 6) | (c << 1) | (d >> 4);
        out[pb++] = ((d & 0b1111) << 4) | (e >> 1);
        out[pb++] = ((e & 0b1) << 7) | (f << 2) | (g >> 3);
        out[pb++] = ((g & 0b111) << 5) | h;
    }
    if (r === 0)
        return out.subarray(0, pb);
    const a = quintet(s, ps++);
    const b = quintet(s, ps++);
    out[pb++] = (a << 3) | (b >> 2);
    if (r <= 2)
        return out.subarray(0, pb);
    const c = quintet(s, ps++);
    const d = quintet(s, ps++);
    out[pb++] = ((b & 0b11) << 6) | (c << 1) | (d >> 4);
    if (r <= 4)
        return out.subarray(0, pb);
    const e = quintet(s, ps++);
    out[pb++] = ((d & 0b1111) << 4) | (e >> 1);
    if (r <= 5)
        return out.subarray(0, pb);
    const f = quintet(s, ps++);
    const g = quintet(s, ps++);
    out[pb++] = ((e & 0b1) << 7) | (f << 2) | (g >> 3);
    if (r <= 7)
        return out.subarray(0, pb);
    const h = quintet(s, ps++);
    out[pb++] = ((g & 0b111) << 5) | h;
    return out.subarray(0, pb);
}
exports.decode = decode;
function encode(buf) {
    if (typeof buf === 'string')
        buf = b4a_1.default.from(buf);
    const max = buf.byteLength * 8;
    let s = '';
    for (let p = 0; p < max; p += 5) {
        const i = p >> 3;
        const j = p & 7;
        if (j <= 3) {
            s += ALPHABET[(buf[i] >> (3 - j)) & 0b11111];
            continue;
        }
        const of = j - 3;
        const h = (buf[i] << of) & 0b11111;
        const l = (i >= buf.length ? 0 : buf[i + 1]) >> (8 - of);
        s += ALPHABET[h | l];
    }
    return s;
}
exports.encode = encode;
function quintet(s, i) {
    if (i > s.length) {
        return 0;
    }
    const v = s.charCodeAt(i);
    if (v < MIN || v > MAX) {
        throw Error('Invalid character in base32 input: "' + s[i] + '" at position ' + i);
    }
    const bits = REVERSE[v - MIN];
    if (bits === -1) {
        throw Error('Invalid character in base32 input: "' + s[i] + '" at position ' + i);
    }
    return bits;
}
//# sourceMappingURL=index.js.map
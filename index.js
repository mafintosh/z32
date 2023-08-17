const b4a = require('b4a')

const ALPHABET = 'ybndrfg8ejkmcpqxot1uwisza345h769'
const ALPHABET_UPPER = ALPHABET.toUpperCase()
const MIN = 0x30 // 0
const MAX = 0x7a // z
const REVERSE = new Int8Array(1 + MAX - MIN)
const REVERSE_LOOSE = new Int8Array(1 + MAX - MIN)

// For decoding, allow easily mistaken characters
const looseMappings = {
  2: 'z',
  0: 'o',
  l: '1',
  v: 'u',
  V: 'u'
}

REVERSE.fill(-1)
REVERSE_LOOSE.fill(-1)

for (let i = 0; i < ALPHABET.length; i++) {
  const v = ALPHABET.charCodeAt(i) - MIN
  REVERSE[v] = REVERSE_LOOSE[v] = i
}

for (let i = 0; i < ALPHABET_UPPER.length; i++) {
  const v = ALPHABET_UPPER.charCodeAt(i) - MIN
  REVERSE_LOOSE[v] = i
}

for (const [from, to] of Object.entries(looseMappings)) {
  const i = ALPHABET.indexOf(to)
  const v = from.charCodeAt(0) - MIN
  REVERSE_LOOSE[v] = i
}

exports.encode = encode
exports.decode = decode

function decode (s, out, opts) {
  if (out && !b4a.isBuffer(out)) {
    opts = out
    out = null
  }
  const { loose } = opts || {}
  let pb = 0
  let ps = 0
  const reverse = loose ? REVERSE_LOOSE : REVERSE

  const r = s.length & 7
  const q = (s.length - r) / 8

  if (!out) out = b4a.allocUnsafe(Math.ceil(s.length * 5 / 8))

  // 0 5 2 7 4 1 6 3 (+5 mod 8)
  for (let i = 0; i < q; i++) {
    const a = quintet(s, ps++, reverse)
    const b = quintet(s, ps++, reverse)
    const c = quintet(s, ps++, reverse)
    const d = quintet(s, ps++, reverse)
    const e = quintet(s, ps++, reverse)
    const f = quintet(s, ps++, reverse)
    const g = quintet(s, ps++, reverse)
    const h = quintet(s, ps++, reverse)

    out[pb++] = (a << 3) | (b >>> 2)
    out[pb++] = ((b & 0b11) << 6) | (c << 1) | (d >>> 4)
    out[pb++] = ((d & 0b1111) << 4) | (e >>> 1)
    out[pb++] = ((e & 0b1) << 7) | (f << 2) | (g >>> 3)
    out[pb++] = ((g & 0b111) << 5) | h
  }

  if (r === 0) return out.subarray(0, pb)

  const a = quintet(s, ps++, reverse)
  const b = quintet(s, ps++, reverse)

  out[pb++] = (a << 3) | (b >>> 2)

  if (r <= 2) return out.subarray(0, pb)

  const c = quintet(s, ps++, reverse)
  const d = quintet(s, ps++, reverse)

  out[pb++] = ((b & 0b11) << 6) | (c << 1) | (d >>> 4)

  if (r <= 4) return out.subarray(0, pb)

  const e = quintet(s, ps++, reverse)

  out[pb++] = ((d & 0b1111) << 4) | (e >>> 1)

  if (r <= 5) return out.subarray(0, pb)

  const f = quintet(s, ps++, reverse)
  const g = quintet(s, ps++, reverse)

  out[pb++] = ((e & 0b1) << 7) | (f << 2) | (g >>> 3)

  if (r <= 7) return out.subarray(0, pb)

  const h = quintet(s, ps++, reverse)

  out[pb++] = ((g & 0b111) << 5) | h

  return out.subarray(0, pb)
}

function encode (buf) {
  if (typeof buf === 'string') buf = b4a.from(buf)

  const max = buf.byteLength * 8

  let s = ''

  for (let p = 0; p < max; p += 5) {
    const i = p >>> 3
    const j = p & 7

    if (j <= 3) {
      s += ALPHABET[(buf[i] >>> (3 - j)) & 0b11111]
      continue
    }

    const of = j - 3
    const h = (buf[i] << of) & 0b11111
    const l = (i >= buf.byteLength ? 0 : buf[i + 1]) >>> (8 - of)

    s += ALPHABET[h | l]
  }

  return s
}

function quintet (s, i, reverse) {
  if (i > s.length) {
    return 0
  }

  const v = s.charCodeAt(i)

  if (v < MIN || v > MAX) {
    throw Error('Invalid character in base32 input: "' + s[i] + '" at position ' + i)
  }

  const bits = reverse[v - MIN]

  if (bits === -1) {
    throw Error('Invalid character in base32 input: "' + s[i] + '" at position ' + i)
  }

  return bits
}

# Base256 alphabet draft

This preserves the latest accepted explicit Base256 alphabet from the design discussion.
Base128 remains the preferred tradeoff. Base256 is an exploratory alphabet, not an
implemented codec or a published format. Existing Base128 specifications, code,
fixtures, and indices are unchanged.

## Mapping

The full machine-readable mapping is in [base256-alphabet.json](base256-alphabet.json).
Indices 0–127 exactly match [Base128 Compact](../../specs/alphabet.json).
Indices 128–255 are the additions below. Each digit is one Unicode scalar value;
comparison is exact, with no normalization, case folding, or implicit aliases.
Base128 Math aliases cannot carry over: their symbols are independent digits here.

The proposed binary interpretation is one byte per digit, using its index as the
byte value. This is distinct from Base128's seven-bit packing. No codec, envelope,
integer API, or compatibility policy is finalized by this draft.

## Additions

The additions are grouped by related shapes and meanings. Read left to right,
then top to bottom. This ordering supersedes earlier draft indices 128–255.
Spoken labels use at most two space-separated words, including conventional
hyphenated names.

```text
128–143  ■ ▲ ◆ ◇ ★ ☆ ⬟ ⬢ ◐ ▰ ⌖ ⌬ ⊞ ⊠ ⊕ ⊗
144–159  ⌘ ⌥ ⌫ ⎋ ⏏ ⌂ ✓ ✎ ⚙ ⚒ ⚗ ⚖ ✂ ⚔ ⚕ ⚑
160–175  ☀ ☾ ☁ ☃ ☂ ❄ ☄ ☎ ✉ ☯ ☮ ☢ ☣ ♭ ♮ ♫
176–191  ♚ ♛ ♜ ♞ ♟ ♠ ♣ ♥ Æ æ Œ œ Ð ð Þ þ
192–207  Ç ç Ø ℵ ℏ ¡ ¿ … † ‡ ※ ⁂ ✠ ⚜ ° ‰
208–223  ¢ £ ¤ € ± × ∠ ⋈ ≡ ≜ ≈ ≠ ≤ ≥ ∝ ∞
224–239  ∂ ∇ ∏ ∑ √ ∫ ∮ ⊥ ∈ ∉ ∩ ∪ ⊂ ⊃ ⊆ ⊇
240–255  ⊢ ¬ ∀ ∃ ∴ ∵ ↔ ↕ ← ↑ → ↓ ↗ ↘ ↙ ↖
```

| Index | Character | Code point | Spoken name |
|---:|:---:|---|---|
| 128 | ■ | U+25A0 | Square |
| 129 | ▲ | U+25B2 | Triangle |
| 130 | ◆ | U+25C6 | Diamond |
| 131 | ◇ | U+25C7 | Hollow diamond |
| 132 | ★ | U+2605 | Star |
| 133 | ☆ | U+2606 | Hollow star |
| 134 | ⬟ | U+2B1F | Pentagon |
| 135 | ⬢ | U+2B22 | Hexagon |
| 136 | ◐ | U+25D0 | Half circle |
| 137 | ▰ | U+25B0 | Parallelogram |
| 138 | ⌖ | U+2316 | Crosshair |
| 139 | ⌬ | U+232C | Benzene ring |
| 140 | ⊞ | U+229E | Squared plus |
| 141 | ⊠ | U+22A0 | Squared times |
| 142 | ⊕ | U+2295 | Circled plus |
| 143 | ⊗ | U+2297 | Circled times |
| 144 | ⌘ | U+2318 | Command |
| 145 | ⌥ | U+2325 | Option |
| 146 | ⌫ | U+232B | Backspace |
| 147 | ⎋ | U+238B | Escape |
| 148 | ⏏ | U+23CF | Eject |
| 149 | ⌂ | U+2302 | House |
| 150 | ✓ | U+2713 | Checkmark |
| 151 | ✎ | U+270E | Pencil |
| 152 | ⚙ | U+2699 | Gear |
| 153 | ⚒ | U+2692 | Mining tools |
| 154 | ⚗ | U+2697 | Alembic |
| 155 | ⚖ | U+2696 | Scales |
| 156 | ✂ | U+2702 | Scissors |
| 157 | ⚔ | U+2694 | Crossed swords |
| 158 | ⚕ | U+2695 | Medical staff |
| 159 | ⚑ | U+2691 | Flag |
| 160 | ☀ | U+2600 | Sun |
| 161 | ☾ | U+263E | Crescent |
| 162 | ☁ | U+2601 | Cloud |
| 163 | ☃ | U+2603 | Snowman |
| 164 | ☂ | U+2602 | Umbrella |
| 165 | ❄ | U+2744 | Snowflake |
| 166 | ☄ | U+2604 | Comet |
| 167 | ☎ | U+260E | Telephone |
| 168 | ✉ | U+2709 | Envelope |
| 169 | ☯ | U+262F | Yin-yang |
| 170 | ☮ | U+262E | Peace |
| 171 | ☢ | U+2622 | Radiation |
| 172 | ☣ | U+2623 | Biohazard |
| 173 | ♭ | U+266D | Flat |
| 174 | ♮ | U+266E | Natural |
| 175 | ♫ | U+266B | Music |
| 176 | ♚ | U+265A | King |
| 177 | ♛ | U+265B | Queen |
| 178 | ♜ | U+265C | Rook |
| 179 | ♞ | U+265E | Knight |
| 180 | ♟ | U+265F | Pawn |
| 181 | ♠ | U+2660 | Spade |
| 182 | ♣ | U+2663 | Club |
| 183 | ♥ | U+2665 | Heart |
| 184 | Æ | U+00C6 | Capital ash |
| 185 | æ | U+00E6 | Lowercase ash |
| 186 | Œ | U+0152 | Capital OE |
| 187 | œ | U+0153 | Lowercase OE |
| 188 | Ð | U+00D0 | Capital eth |
| 189 | ð | U+00F0 | Lowercase eth |
| 190 | Þ | U+00DE | Capital thorn |
| 191 | þ | U+00FE | Lowercase thorn |
| 192 | Ç | U+00C7 | Capital cedilla |
| 193 | ç | U+00E7 | Lowercase cedilla |
| 194 | Ø | U+00D8 | Slashed O |
| 195 | ℵ | U+2135 | Aleph |
| 196 | ℏ | U+210F | H-bar |
| 197 | ¡ | U+00A1 | Inverted exclamation |
| 198 | ¿ | U+00BF | Inverted question |
| 199 | … | U+2026 | Ellipsis |
| 200 | † | U+2020 | Dagger |
| 201 | ‡ | U+2021 | Double dagger |
| 202 | ※ | U+203B | Reference mark |
| 203 | ⁂ | U+2042 | Asterism |
| 204 | ✠ | U+2720 | Maltese cross |
| 205 | ⚜ | U+269C | Fleur-de-lis |
| 206 | ° | U+00B0 | Degree |
| 207 | ‰ | U+2030 | Per mille |
| 208 | ¢ | U+00A2 | Cent |
| 209 | £ | U+00A3 | Pound sterling |
| 210 | ¤ | U+00A4 | Currency sign |
| 211 | € | U+20AC | Euro |
| 212 | ± | U+00B1 | Plus-minus |
| 213 | × | U+00D7 | Multiplication |
| 214 | ∠ | U+2220 | Angle |
| 215 | ⋈ | U+22C8 | Bowtie |
| 216 | ≡ | U+2261 | Identical |
| 217 | ≜ | U+225C | Defined as |
| 218 | ≈ | U+2248 | Approximately equal |
| 219 | ≠ | U+2260 | Not equal |
| 220 | ≤ | U+2264 | Less-equal |
| 221 | ≥ | U+2265 | Greater-equal |
| 222 | ∝ | U+221D | Proportional |
| 223 | ∞ | U+221E | Infinity |
| 224 | ∂ | U+2202 | Partial |
| 225 | ∇ | U+2207 | Nabla |
| 226 | ∏ | U+220F | Product |
| 227 | ∑ | U+2211 | Summation |
| 228 | √ | U+221A | Square root |
| 229 | ∫ | U+222B | Integral |
| 230 | ∮ | U+222E | Contour integral |
| 231 | ⊥ | U+22A5 | Perpendicular |
| 232 | ∈ | U+2208 | Member |
| 233 | ∉ | U+2209 | Nonmember |
| 234 | ∩ | U+2229 | Intersection |
| 235 | ∪ | U+222A | Union |
| 236 | ⊂ | U+2282 | Subset |
| 237 | ⊃ | U+2283 | Superset |
| 238 | ⊆ | U+2286 | Inclusive subset |
| 239 | ⊇ | U+2287 | Inclusive superset |
| 240 | ⊢ | U+22A2 | Turnstile |
| 241 | ¬ | U+00AC | Logical not |
| 242 | ∀ | U+2200 | For all |
| 243 | ∃ | U+2203 | There exists |
| 244 | ∴ | U+2234 | Therefore |
| 245 | ∵ | U+2235 | Because |
| 246 | ↔ | U+2194 | Left-right |
| 247 | ↕ | U+2195 | Up-down |
| 248 | ← | U+2190 | Left |
| 249 | ↑ | U+2191 | Up |
| 250 | → | U+2192 | Right |
| 251 | ↓ | U+2193 | Down |
| 252 | ↗ | U+2197 | Upper right |
| 253 | ↘ | U+2198 | Lower right |
| 254 | ↙ | U+2199 | Lower left |
| 255 | ↖ | U+2196 | Upper left |

## Tradeoffs and remaining concerns

For uniformly distributed input bytes, this exact alphabet averages 2.0546875
UTF-8 bytes per input byte, excluding headers. That is fewer displayed symbols
than Base64 or Base128, but more UTF-8 storage.

Letters with above-letter accents are excluded. Ash, OE, eth, thorn, C cedilla,
and capital O stroke remain. Only the ten basic directional arrows remain;
double-shaft and hooked arrows are excluded. Eject is retained. Anchor and the
trigram that resembled the identical sign are excluded.

Emoji-capable symbols are permitted, but consistent terminal presentation matters.
Lightning, hourglass, cup, and watch were removed after their rendering disrupted
the set. Crosshair, benzene ring, asterism, and black king replace them. Further
font and rendering checks remain necessary at ordinary text sizes.

Remaining candidates for reconsideration include product `∏` versus existing Pi
`Π`, multiplication `×` versus `x`, ellipsis `…` versus three periods, flat `♭`
versus `b`, and degree `°` versus circular letters. Small-stroke distinctions also
remain in membership, subset, superset, and integral families. These concerns do
not authorize changes to the saved mapping.

## Modifier alternatives

[Emilien Breton's Base256 note](https://emilien.ca/Notes/Notes/notes/base256.md)
explores 128 base symbols plus an unspecified modifier for the high bit, with
ASCII-preserving assignments. That is a separate design from this draft.

Combining overline on Base128, and independently optional overline and underline
on Base64, were considered but not selected. They require multiple code points
for marked digits, add UTF-8 overhead, and can place marks unevenly across glyphs.
For uniformly distributed input, the Base128 Compact plus overline construction
averages 2.265625 UTF-8 bytes per input byte; the Base64 two-mark construction
averages 3. Neither changes the explicit alphabet preserved here.

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

```text
128–143  ■▲◆♜★⬟⬢◐▰◇☆⌂⌘⌥⌫♛
144–159  ♭♮∠∮≡≜⊢♞☾⊞⊠⋈ℵℏ✓♫
160–175  Ä♠♣ÆÇÐÉ♥ÎÑÖØÜ☯ÞŒ
176–191  ä☮☢æçðé⚖îñö⎋üýþœ
192–207  ¡¿¢£¤€°±×✠⚑…†‡‰※
208–223  ∂∇∏∑√∫∞≈≠≤≥∝∴∵∈∉
224–239  ☀∩∪⊂⊃⊆⊇⊕⊗⊥☂✂❄¬∀∃
240–255  ←↑→↓↔↕⇐⇒⇔↗↘↙↖⏏↩↪
```

| Index | Character | Code point | Spoken name |
|---:|:---:|---|---|
| 128 | ■ | U+25A0 | Square |
| 129 | ▲ | U+25B2 | Triangle |
| 130 | ◆ | U+25C6 | Diamond |
| 131 | ♜ | U+265C | Rook |
| 132 | ★ | U+2605 | Star |
| 133 | ⬟ | U+2B1F | Pentagon |
| 134 | ⬢ | U+2B22 | Hexagon |
| 135 | ◐ | U+25D0 | Half circle |
| 136 | ▰ | U+25B0 | Parallelogram |
| 137 | ◇ | U+25C7 | Hollow diamond |
| 138 | ☆ | U+2606 | Hollow star |
| 139 | ⌂ | U+2302 | House |
| 140 | ⌘ | U+2318 | Command |
| 141 | ⌥ | U+2325 | Option |
| 142 | ⌫ | U+232B | Backspace |
| 143 | ♛ | U+265B | Queen |
| 144 | ♭ | U+266D | Flat |
| 145 | ♮ | U+266E | Natural |
| 146 | ∠ | U+2220 | Angle |
| 147 | ∮ | U+222E | Contour integral |
| 148 | ≡ | U+2261 | Identical |
| 149 | ≜ | U+225C | Defined as |
| 150 | ⊢ | U+22A2 | Turnstile |
| 151 | ♞ | U+265E | Knight |
| 152 | ☾ | U+263E | Crescent |
| 153 | ⊞ | U+229E | Squared plus |
| 154 | ⊠ | U+22A0 | Squared times |
| 155 | ⋈ | U+22C8 | Bowtie |
| 156 | ℵ | U+2135 | Aleph |
| 157 | ℏ | U+210F | H-bar |
| 158 | ✓ | U+2713 | Checkmark |
| 159 | ♫ | U+266B | Music |
| 160 | Ä | U+00C4 | Capital A diaeresis |
| 161 | ♠ | U+2660 | Spade |
| 162 | ♣ | U+2663 | Club |
| 163 | Æ | U+00C6 | Capital AE |
| 164 | Ç | U+00C7 | Capital C cedilla |
| 165 | Ð | U+00D0 | Capital eth |
| 166 | É | U+00C9 | Capital E acute |
| 167 | ♥ | U+2665 | Heart |
| 168 | Î | U+00CE | Capital I circumflex |
| 169 | Ñ | U+00D1 | Capital N tilde |
| 170 | Ö | U+00D6 | Capital O diaeresis |
| 171 | Ø | U+00D8 | Capital O stroke |
| 172 | Ü | U+00DC | Capital U diaeresis |
| 173 | ☯ | U+262F | Yin-yang |
| 174 | Þ | U+00DE | Capital thorn |
| 175 | Œ | U+0152 | Capital OE |
| 176 | ä | U+00E4 | Lowercase A diaeresis |
| 177 | ☮ | U+262E | Peace |
| 178 | ☢ | U+2622 | Radiation |
| 179 | æ | U+00E6 | Lowercase AE |
| 180 | ç | U+00E7 | Lowercase C cedilla |
| 181 | ð | U+00F0 | Lowercase eth |
| 182 | é | U+00E9 | Lowercase E acute |
| 183 | ⚖ | U+2696 | Scales |
| 184 | î | U+00EE | Lowercase I circumflex |
| 185 | ñ | U+00F1 | Lowercase N tilde |
| 186 | ö | U+00F6 | Lowercase O diaeresis |
| 187 | ⎋ | U+238B | Escape |
| 188 | ü | U+00FC | Lowercase U diaeresis |
| 189 | ý | U+00FD | Lowercase Y acute |
| 190 | þ | U+00FE | Lowercase thorn |
| 191 | œ | U+0153 | Lowercase OE |
| 192 | ¡ | U+00A1 | Inverted exclamation |
| 193 | ¿ | U+00BF | Inverted question |
| 194 | ¢ | U+00A2 | Cent |
| 195 | £ | U+00A3 | Pound sterling |
| 196 | ¤ | U+00A4 | Currency sign |
| 197 | € | U+20AC | Euro |
| 198 | ° | U+00B0 | Degree |
| 199 | ± | U+00B1 | Plus or minus |
| 200 | × | U+00D7 | Multiplication |
| 201 | ✠ | U+2720 | Maltese cross |
| 202 | ⚑ | U+2691 | Flag |
| 203 | … | U+2026 | Ellipsis |
| 204 | † | U+2020 | Dagger |
| 205 | ‡ | U+2021 | Double dagger |
| 206 | ‰ | U+2030 | Per mille |
| 207 | ※ | U+203B | Reference mark |
| 208 | ∂ | U+2202 | Partial |
| 209 | ∇ | U+2207 | Nabla |
| 210 | ∏ | U+220F | Product |
| 211 | ∑ | U+2211 | Summation |
| 212 | √ | U+221A | Square root |
| 213 | ∫ | U+222B | Integral |
| 214 | ∞ | U+221E | Infinity |
| 215 | ≈ | U+2248 | Approximately equal |
| 216 | ≠ | U+2260 | Not equal |
| 217 | ≤ | U+2264 | Less than or equal |
| 218 | ≥ | U+2265 | Greater than or equal |
| 219 | ∝ | U+221D | Proportional to |
| 220 | ∴ | U+2234 | Therefore |
| 221 | ∵ | U+2235 | Because |
| 222 | ∈ | U+2208 | Element of |
| 223 | ∉ | U+2209 | Not an element of |
| 224 | ☀ | U+2600 | Sun |
| 225 | ∩ | U+2229 | Intersection |
| 226 | ∪ | U+222A | Union |
| 227 | ⊂ | U+2282 | Subset |
| 228 | ⊃ | U+2283 | Superset |
| 229 | ⊆ | U+2286 | Subset or equal |
| 230 | ⊇ | U+2287 | Superset or equal |
| 231 | ⊕ | U+2295 | Circled plus |
| 232 | ⊗ | U+2297 | Circled times |
| 233 | ⊥ | U+22A5 | Perpendicular |
| 234 | ☂ | U+2602 | Umbrella |
| 235 | ✂ | U+2702 | Scissors |
| 236 | ❄ | U+2744 | Snowflake |
| 237 | ¬ | U+00AC | Logical not |
| 238 | ∀ | U+2200 | For all |
| 239 | ∃ | U+2203 | There exists |
| 240 | ← | U+2190 | Left arrow |
| 241 | ↑ | U+2191 | Up arrow |
| 242 | → | U+2192 | Right arrow |
| 243 | ↓ | U+2193 | Down arrow |
| 244 | ↔ | U+2194 | Left-right arrow |
| 245 | ↕ | U+2195 | Up-down arrow |
| 246 | ⇐ | U+21D0 | Double left arrow |
| 247 | ⇒ | U+21D2 | Double right arrow |
| 248 | ⇔ | U+21D4 | Double left-right arrow |
| 249 | ↗ | U+2197 | Up-right arrow |
| 250 | ↘ | U+2198 | Down-right arrow |
| 251 | ↙ | U+2199 | Down-left arrow |
| 252 | ↖ | U+2196 | Up-left arrow |
| 253 | ⏏ | U+23CF | Eject |
| 254 | ↩ | U+21A9 | Left arrow with hook |
| 255 | ↪ | U+21AA | Right arrow with hook |

## Tradeoffs and remaining concerns

For uniformly distributed input bytes, this exact alphabet averages 2.003906
UTF-8 bytes per input byte, excluding headers. That is fewer displayed symbols
than Base64 or Base128, but more UTF-8 storage. Font and rendering tests remain
necessary, particularly at ordinary text sizes.

The accepted ten replacements are rook, queen, escape, Maltese cross, flag, sun,
umbrella, scissors, snowflake, and eject. They replace disc, sharp, lowercase O
stroke, middle dot, bullet, empty set, parallel, logical and, logical or, and right
arrow from bar at their respective original indices. Anchor is excluded.
Emoji-capable symbols are permitted in this draft; presentation may vary by app.

Remaining candidates for reconsideration include product `∏` versus existing Pi
`Π`, multiplication `×` versus `x`, ellipsis `…` versus three periods, flat `♭`
versus `b`, degree `°` versus circular letters, and accented I `Î î`.
Small-stroke distinctions also remain in membership, subset, superset, and arrow
families. These concerns do not authorize changes to the saved mapping.

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

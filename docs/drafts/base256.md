# Base256 accepted alphabet

This is the accepted Base256 character set and index ordering. It supersedes
previous alphabet drafts. Base128 remains the preferred tradeoff; a Base256 codec
is not implemented or published. Existing Base128 specifications, code, fixtures,
and indices are unchanged.

## Mapping

The full machine-readable mapping is in [base256-alphabet.json](base256-alphabet.json).
Indices 0–127 exactly match [Base128 Compact](../../specs/alphabet.json).
Indices 128–255 are the additions below. Each digit is one Unicode scalar value;
comparison is exact, with no normalization, case folding, or implicit aliases.
Base128 Math aliases cannot carry over: their symbols are independent digits here.

The proposed binary interpretation is one byte per digit, using its index as the
byte value. This is distinct from Base128's seven-bit packing. Codec APIs,
envelopes, integer encoding, and release compatibility policy remain future work.
Changes to this accepted alphabet require an explicit design decision.

## Additions

Read down each column, then move right. Spoken labels use at most two
space-separated words, including conventional hyphenated names. Venus and Mars
are the canonical spoken labels for the female and male signs, respectively.

| 128–143 | 144–159 | 160–175 | 176–191 | 192–207 | 208–223 | 224–239 | 240–255 |
|---|---|---|---|---|---|---|---|
| ■ Square | ⌘ Command | ☀ Sun | ♚ King | ☿ Mercury | ± Plus-minus | ∈ Member | ¡ Inverted exclamation |
| ▲ Triangle | ⌥ Option | ☾ Crescent | ♛ Queen | ♀ Venus | × Multiplication | ∉ Nonmember | ¿ Inverted question |
| ♦ Diamond | ⌫ Backspace | ☠ Skull | ♜ Rook | ♁ Earth | ≡ Identical | ∩ Intersection | … Ellipsis |
| ◇ Hollow diamond | ⎋ Escape | ☃ Snowman | ♝ Bishop | ♂ Mars | ≜ Defined as | ∪ Union | † Dagger |
| ★ Star | ⏏ Eject | ☂ Umbrella | ♞ Knight | ♃ Jupiter | ≈ Approximately equal | ⊂ Subset | ‡ Double dagger |
| ☆ Hollow star | ⌂ House | ❄ Snowflake | ♟ Pawn | ♄ Saturn | ≠ Not equal | ⊃ Superset | ‰ Per mille |
| ⬟ Pentagon | ✓ Checkmark | ☄ Comet | ♠ Spade | ♅ Uranus | ≤ Less-equal | ⊆ Inclusive subset | ← Left |
| ⬢ Hexagon | ✎ Pencil | ☎ Telephone | ♣ Club | ♆ Neptune | ≥ Greater-equal | ⊇ Inclusive superset | ↑ Up |
| ◐ Half circle | ⚙ Gear | ✉ Envelope | ♥ Heart | ♇ Pluto | ∝ Proportional | ⊢ Turnstile | → Right |
| ▰ Parallelogram | ⚒ Mining tools | ☯ Yin-yang | ♭ Flat | ℵ Aleph | ∂ Partial | ⊥ Perpendicular | ↓ Down |
| ∠ Angle | ⚗ Alembic | ☮ Peace | ♮ Natural | ℏ H-bar | ∇ Nabla | ¬ Logical not | ↔ Left-right |
| ⋈ Bowtie | ⚖ Scales | ☢ Radiation | ♫ Music | ¢ Cent | ∏ Product | ∀ For all | ↕ Up-down |
| ⌖ Crosshair | ✂ Scissors | ☣ Biohazard | Æ Capital ash | £ Pound sterling | ∑ Summation | ∃ There exists | ↗ Upper right |
| ♯ Sharp | ⚔ Crossed swords | ⚠ Warning | æ Lowercase ash | ¤ Currency sign | √ Square root | ∴ Therefore | ↘ Lower right |
| ⚘ Flower | ⚕ Medical staff | ✈ Airplane | Ç Capital cedilla | € Euro | ∫ Integral | ∵ Because | ↙ Lower left |
| ♻ Recycling | ⚑ Flag | ⚛ Atom | ç Lowercase cedilla | ° Degree | ∮ Contour integral | ∞ Infinity | ↖ Upper left |

### Indexed reference

| Index | Character | Code point | Spoken name |
|---:|:---:|---|---|
| 128 | ■ | U+25A0 | Square |
| 129 | ▲ | U+25B2 | Triangle |
| 130 | ♦ | U+2666 | Diamond |
| 131 | ◇ | U+25C7 | Hollow diamond |
| 132 | ★ | U+2605 | Star |
| 133 | ☆ | U+2606 | Hollow star |
| 134 | ⬟ | U+2B1F | Pentagon |
| 135 | ⬢ | U+2B22 | Hexagon |
| 136 | ◐ | U+25D0 | Half circle |
| 137 | ▰ | U+25B0 | Parallelogram |
| 138 | ∠ | U+2220 | Angle |
| 139 | ⋈ | U+22C8 | Bowtie |
| 140 | ⌖ | U+2316 | Crosshair |
| 141 | ♯ | U+266F | Sharp |
| 142 | ⚘ | U+2698 | Flower |
| 143 | ♻ | U+267B | Recycling |
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
| 162 | ☠ | U+2620 | Skull |
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
| 173 | ⚠ | U+26A0 | Warning |
| 174 | ✈ | U+2708 | Airplane |
| 175 | ⚛ | U+269B | Atom |
| 176 | ♚ | U+265A | King |
| 177 | ♛ | U+265B | Queen |
| 178 | ♜ | U+265C | Rook |
| 179 | ♝ | U+265D | Bishop |
| 180 | ♞ | U+265E | Knight |
| 181 | ♟ | U+265F | Pawn |
| 182 | ♠ | U+2660 | Spade |
| 183 | ♣ | U+2663 | Club |
| 184 | ♥ | U+2665 | Heart |
| 185 | ♭ | U+266D | Flat |
| 186 | ♮ | U+266E | Natural |
| 187 | ♫ | U+266B | Music |
| 188 | Æ | U+00C6 | Capital ash |
| 189 | æ | U+00E6 | Lowercase ash |
| 190 | Ç | U+00C7 | Capital cedilla |
| 191 | ç | U+00E7 | Lowercase cedilla |
| 192 | ☿ | U+263F | Mercury |
| 193 | ♀ | U+2640 | Venus |
| 194 | ♁ | U+2641 | Earth |
| 195 | ♂ | U+2642 | Mars |
| 196 | ♃ | U+2643 | Jupiter |
| 197 | ♄ | U+2644 | Saturn |
| 198 | ♅ | U+2645 | Uranus |
| 199 | ♆ | U+2646 | Neptune |
| 200 | ♇ | U+2647 | Pluto |
| 201 | ℵ | U+2135 | Aleph |
| 202 | ℏ | U+210F | H-bar |
| 203 | ¢ | U+00A2 | Cent |
| 204 | £ | U+00A3 | Pound sterling |
| 205 | ¤ | U+00A4 | Currency sign |
| 206 | € | U+20AC | Euro |
| 207 | ° | U+00B0 | Degree |
| 208 | ± | U+00B1 | Plus-minus |
| 209 | × | U+00D7 | Multiplication |
| 210 | ≡ | U+2261 | Identical |
| 211 | ≜ | U+225C | Defined as |
| 212 | ≈ | U+2248 | Approximately equal |
| 213 | ≠ | U+2260 | Not equal |
| 214 | ≤ | U+2264 | Less-equal |
| 215 | ≥ | U+2265 | Greater-equal |
| 216 | ∝ | U+221D | Proportional |
| 217 | ∂ | U+2202 | Partial |
| 218 | ∇ | U+2207 | Nabla |
| 219 | ∏ | U+220F | Product |
| 220 | ∑ | U+2211 | Summation |
| 221 | √ | U+221A | Square root |
| 222 | ∫ | U+222B | Integral |
| 223 | ∮ | U+222E | Contour integral |
| 224 | ∈ | U+2208 | Member |
| 225 | ∉ | U+2209 | Nonmember |
| 226 | ∩ | U+2229 | Intersection |
| 227 | ∪ | U+222A | Union |
| 228 | ⊂ | U+2282 | Subset |
| 229 | ⊃ | U+2283 | Superset |
| 230 | ⊆ | U+2286 | Inclusive subset |
| 231 | ⊇ | U+2287 | Inclusive superset |
| 232 | ⊢ | U+22A2 | Turnstile |
| 233 | ⊥ | U+22A5 | Perpendicular |
| 234 | ¬ | U+00AC | Logical not |
| 235 | ∀ | U+2200 | For all |
| 236 | ∃ | U+2203 | There exists |
| 237 | ∴ | U+2234 | Therefore |
| 238 | ∵ | U+2235 | Because |
| 239 | ∞ | U+221E | Infinity |
| 240 | ¡ | U+00A1 | Inverted exclamation |
| 241 | ¿ | U+00BF | Inverted question |
| 242 | … | U+2026 | Ellipsis |
| 243 | † | U+2020 | Dagger |
| 244 | ‡ | U+2021 | Double dagger |
| 245 | ‰ | U+2030 | Per mille |
| 246 | ← | U+2190 | Left |
| 247 | ↑ | U+2191 | Up |
| 248 | → | U+2192 | Right |
| 249 | ↓ | U+2193 | Down |
| 250 | ↔ | U+2194 | Left-right |
| 251 | ↕ | U+2195 | Up-down |
| 252 | ↗ | U+2197 | Upper right |
| 253 | ↘ | U+2198 | Lower right |
| 254 | ↙ | U+2199 | Lower left |
| 255 | ↖ | U+2196 | Upper left |

## Design choices and tradeoffs

The set includes all six black chess pieces, four card suits, three musical
accidentals, and nine traditional planetary symbols including Pluto. Diamond
uses the card-suit character `♦`, not geometric diamond `◆`. Ash and C cedilla
remain; OE, eth, thorn, and slashed O are excluded. The ten basic directional
arrows remain, with no double-shaft or hooked variants.

Emoji-capable symbols are permitted, but consistent terminal presentation matters.
Lightning, hourglass, cup, and watch are excluded after their rendering disrupted
the set. Encoded digits do not include variation selectors. Rendering can still
vary between fonts and applications.

The accepted set retains mathematical symbols and accidentals for their familiar
meanings, despite possible similarities such as `∏` and `Π`, `×` and `x`, or `♯`
and `#`. These are deliberate design tradeoffs, not pending replacement requests.

For uniformly distributed input bytes, this exact alphabet averages 2.08203125
UTF-8 bytes per input byte, excluding headers. That is fewer displayed symbols
than Base64 or Base128, but more UTF-8 storage. Further font and rendering checks
remain useful at ordinary text sizes.

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

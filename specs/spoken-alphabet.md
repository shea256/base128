# Base128 v0.1 spoken alphabet

These are proposed English reading names for the official alphabet, not a tested
speech standard. Custom alphabets need their own agreed table.

## How to read a payload aloud

- Agree on the alphabet. Say “capital” before every uppercase letter;
  an unqualified letter name means lowercase. Read digits individually.
- Latin letters use their ordinary English names (for example, “capital bee” for
  `B`, “bee” for `b`). If audio is unclear, use phonetic spelling words such as
  “Bravo.” In that convention include “Latin” or “Greek”: phonetic Alfa and Delta
  otherwise overlap with Greek Alpha and Delta.
- Pause between characters and read short groups back. Say “repeat” before
  repeating a character so the listener does not append a duplicate.
- For uncertainty, say “symbol” followed by all three index digits separately,
  including leading zeros. For example, “symbol zero eight one” means `Γ`.
  Numeric fallbacks refer to the agreed alphabet; they are not literal input.
- Preserve exact case and characters. Spoken names and pauses are not payload data.
- Confirm the character count and read back the value. Bare encoding has no
  checksum. If the value has an optional checksum, verify it with the decoder;
  CRC-32 detects accidental changes, not deliberate tampering.

Ordinary Latin letter names can sound alike. Greek Eta/Theta/Zeta and Pi/Phi/Psi/Xi
can also be confused across accents or pronunciation conventions. Use spelling
words or numeric fallbacks when needed; “capital” resolves case, not every sound.

## Character table

| Index | Character | Spoken name | Numeric fallback |
| ---: | :---: | --- | --- |
| 0 | <code>0</code> | Zero | symbol zero zero zero |
| 1 | <code>1</code> | One | symbol zero zero one |
| 2 | <code>2</code> | Two | symbol zero zero two |
| 3 | <code>3</code> | Three | symbol zero zero three |
| 4 | <code>4</code> | Four | symbol zero zero four |
| 5 | <code>5</code> | Five | symbol zero zero five |
| 6 | <code>6</code> | Six | symbol zero zero six |
| 7 | <code>7</code> | Seven | symbol zero zero seven |
| 8 | <code>8</code> | Eight | symbol zero zero eight |
| 9 | <code>9</code> | Nine | symbol zero zero nine |
| 10 | <code>a</code> | Ay | symbol zero one zero |
| 11 | <code>b</code> | Bee | symbol zero one one |
| 12 | <code>c</code> | See | symbol zero one two |
| 13 | <code>d</code> | Dee | symbol zero one three |
| 14 | <code>e</code> | Ee | symbol zero one four |
| 15 | <code>f</code> | Ef | symbol zero one five |
| 16 | <code>g</code> | Jee | symbol zero one six |
| 17 | <code>h</code> | Aitch | symbol zero one seven |
| 18 | <code>i</code> | Eye | symbol zero one eight |
| 19 | <code>j</code> | Jay | symbol zero one nine |
| 20 | <code>k</code> | Kay | symbol zero two zero |
| 21 | <code>l</code> | El | symbol zero two one |
| 22 | <code>m</code> | Em | symbol zero two two |
| 23 | <code>n</code> | En | symbol zero two three |
| 24 | <code>o</code> | Oh | symbol zero two four |
| 25 | <code>p</code> | Pee | symbol zero two five |
| 26 | <code>q</code> | Cue | symbol zero two six |
| 27 | <code>r</code> | Ar | symbol zero two seven |
| 28 | <code>s</code> | Ess | symbol zero two eight |
| 29 | <code>t</code> | Tee | symbol zero two nine |
| 30 | <code>u</code> | You | symbol zero three zero |
| 31 | <code>v</code> | Vee | symbol zero three one |
| 32 | <code>w</code> | Double-you | symbol zero three two |
| 33 | <code>x</code> | Ex | symbol zero three three |
| 34 | <code>y</code> | Why | symbol zero three four |
| 35 | <code>z</code> | Zee | symbol zero three five |
| 36 | <code>A</code> | Capital ay | symbol zero three six |
| 37 | <code>B</code> | Capital bee | symbol zero three seven |
| 38 | <code>C</code> | Capital see | symbol zero three eight |
| 39 | <code>D</code> | Capital dee | symbol zero three nine |
| 40 | <code>E</code> | Capital ee | symbol zero four zero |
| 41 | <code>F</code> | Capital ef | symbol zero four one |
| 42 | <code>G</code> | Capital jee | symbol zero four two |
| 43 | <code>H</code> | Capital aitch | symbol zero four three |
| 44 | <code>I</code> | Capital eye | symbol zero four four |
| 45 | <code>J</code> | Capital jay | symbol zero four five |
| 46 | <code>K</code> | Capital kay | symbol zero four six |
| 47 | <code>L</code> | Capital el | symbol zero four seven |
| 48 | <code>M</code> | Capital em | symbol zero four eight |
| 49 | <code>N</code> | Capital en | symbol zero four nine |
| 50 | <code>O</code> | Capital oh | symbol zero five zero |
| 51 | <code>P</code> | Capital pee | symbol zero five one |
| 52 | <code>Q</code> | Capital cue | symbol zero five two |
| 53 | <code>R</code> | Capital ar | symbol zero five three |
| 54 | <code>S</code> | Capital ess | symbol zero five four |
| 55 | <code>T</code> | Capital tee | symbol zero five five |
| 56 | <code>U</code> | Capital you | symbol zero five six |
| 57 | <code>V</code> | Capital vee | symbol zero five seven |
| 58 | <code>W</code> | Capital double-you | symbol zero five eight |
| 59 | <code>X</code> | Capital ex | symbol zero five nine |
| 60 | <code>Y</code> | Capital why | symbol zero six zero |
| 61 | <code>Z</code> | Capital zee | symbol zero six one |
| 62 | <code>α</code> | Alpha | symbol zero six two |
| 63 | <code>β</code> | Beta | symbol zero six three |
| 64 | <code>γ</code> | Gamma | symbol zero six four |
| 65 | <code>δ</code> | Delta | symbol zero six five |
| 66 | <code>ε</code> | Epsilon | symbol zero six six |
| 67 | <code>ζ</code> | Zeta | symbol zero six seven |
| 68 | <code>η</code> | Eta | symbol zero six eight |
| 69 | <code>θ</code> | Theta | symbol zero six nine |
| 70 | <code>ι</code> | Iota | symbol zero seven zero |
| 71 | <code>κ</code> | Kappa | symbol zero seven one |
| 72 | <code>λ</code> | Lambda | symbol zero seven two |
| 73 | <code>μ</code> | Mu | symbol zero seven three |
| 74 | <code>ξ</code> | Xi | symbol zero seven four |
| 75 | <code>π</code> | Pi | symbol zero seven five |
| 76 | <code>σ</code> | Sigma | symbol zero seven six |
| 77 | <code>τ</code> | Tau | symbol zero seven seven |
| 78 | <code>φ</code> | Phi | symbol zero seven eight |
| 79 | <code>ψ</code> | Psi | symbol zero seven nine |
| 80 | <code>ω</code> | Omega | symbol zero eight zero |
| 81 | <code>Γ</code> | Capital Gamma | symbol zero eight one |
| 82 | <code>Δ</code> | Capital Delta | symbol zero eight two |
| 83 | <code>Θ</code> | Capital Theta | symbol zero eight three |
| 84 | <code>Λ</code> | Capital Lambda | symbol zero eight four |
| 85 | <code>Ξ</code> | Capital Xi | symbol zero eight five |
| 86 | <code>Π</code> | Capital Pi | symbol zero eight six |
| 87 | <code>Σ</code> | Capital Sigma | symbol zero eight seven |
| 88 | <code>Φ</code> | Capital Phi | symbol zero eight eight |
| 89 | <code>Ψ</code> | Capital Psi | symbol zero eight nine |
| 90 | <code>Ω</code> | Capital Omega | symbol zero nine zero |
| 91 | <code>!</code> | Exclamation mark | symbol zero nine one |
| 92 | <code>"</code> | Double quote | symbol zero nine two |
| 93 | <code>#</code> | Number sign | symbol zero nine three |
| 94 | <code>$</code> | Dollar | symbol zero nine four |
| 95 | <code>%</code> | Percent | symbol zero nine five |
| 96 | <code>&amp;</code> | Ampersand | symbol zero nine six |
| 97 | <code>'</code> | Apostrophe | symbol zero nine seven |
| 98 | <code>(</code> | Left parenthesis | symbol zero nine eight |
| 99 | <code>)</code> | Right parenthesis | symbol zero nine nine |
| 100 | <code>*</code> | Asterisk | symbol one zero zero |
| 101 | <code>+</code> | Plus | symbol one zero one |
| 102 | <code>,</code> | Comma | symbol one zero two |
| 103 | <code>-</code> | Hyphen | symbol one zero three |
| 104 | <code>.</code> | Period | symbol one zero four |
| 105 | <code>/</code> | Forward slash | symbol one zero five |
| 106 | <code>:</code> | Colon | symbol one zero six |
| 107 | <code>;</code> | Semicolon | symbol one zero seven |
| 108 | <code>&lt;</code> | Less than | symbol one zero eight |
| 109 | <code>=</code> | Equals | symbol one zero nine |
| 110 | <code>&gt;</code> | Greater than | symbol one one zero |
| 111 | <code>?</code> | Question mark | symbol one one one |
| 112 | <code>@</code> | At sign | symbol one one two |
| 113 | <code>[</code> | Left bracket | symbol one one three |
| 114 | <code>\</code> | Backslash | symbol one one four |
| 115 | <code>]</code> | Right bracket | symbol one one five |
| 116 | <code>^</code> | Caret | symbol one one six |
| 117 | <code>_</code> | Underscore | symbol one one seven |
| 118 | <code>`</code> | Backtick | symbol one one eight |
| 119 | <code>{</code> | Left brace | symbol one one nine |
| 120 | <code>&#124;</code> | Vertical bar | symbol one two zero |
| 121 | <code>}</code> | Right brace | symbol one two one |
| 122 | <code>~</code> | Tilde | symbol one two two |
| 123 | <code>¥</code> | Yen | symbol one two three |
| 124 | <code>÷</code> | Division | symbol one two four |
| 125 | <code>∇</code> | Nabla | symbol one two five |
| 126 | <code>√</code> | Square root | symbol one two six |
| 127 | <code>∫</code> | Integral | symbol one two seven |

## Distinctions to preserve

- Say “zero” for `0`, never “oh”; “oh” means lowercase `o`, “capital oh” means `O`.
- `Π` is “capital pi”; `π` is “pi.” `Σ` is “capital sigma”; `σ` is “sigma.”
- `Δ` is “capital delta”; `δ` is “delta”; `∇` is “nabla.” Avoid “del.”
- `/`, `\`, and `÷` are “forward slash,” “backslash,” and “division.”
- Use “left” or “right” with “parenthesis,” “bracket,” or “brace”; the extra shape words are unnecessary.
- `'`, `"`, and the backtick are “apostrophe,” “double quote,” and “backtick.”
  “Quote” alone is insufficient. Curly quotes are not in the official alphabet.
- `-` is the ASCII hyphen; `~` is the ASCII tilde.

For example, the integer payload `7.` (decimal 1000) is “seven; period,” or
“symbol zero zero seven; symbol one zero four,” in the official alphabet.

## Reading a full envelope

Middle dot (`·`, U+00B7) is a **separator, not one of the 128 payload symbols**.
Say “middle dot” only when reading the full wrapped value. Say “period” for the
payload character `.`. See [envelope.md](envelope.md) for the wire format.

For `b128·00·payload·checksum`, read the literal identifier as
“bee, one, two, eight,” then “middle dot,” the two header symbols as “zero, zero,”
another “middle dot,” the payload symbols, another “middle dot,” and the five
checksum symbols. Placeholder words here are not literal encoded data.

Read header symbols with the fixed official table.
Read payload and checksum symbols with the alphabet selected by the header.
For alphabet escapes, read all three header symbols in order. A checksum-only
value has only the payload, one middle dot, and checksum. A prefix-only value
ends with the payload.

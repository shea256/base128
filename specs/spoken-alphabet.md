# Base128 v0.1 spoken alphabets

Compact is the default alphabet; Math shares indices 0–121 and has six different
symbols at indices 122–127. These are proposed English reading names, not a tested
speech standard. Custom alphabets need their own agreed table.

## How to read a payload aloud

- Agree on Compact or Math. Use the main table for Compact; substitute the six
  Math rows below when reading Math. Say “capital” before every uppercase letter;
  an unqualified letter name means lowercase. Read digits individually.
- Latin letters use their ordinary English names (for example, “capital bee” for
  `B`, “bee” for `b`). If audio is unclear, use phonetic spelling words such as
  “Bravo.” In that convention include “Latin” or “Greek”: phonetic Alfa and Delta
  otherwise overlap with Greek Alpha and Delta.
- Pause between characters and read short groups back. Say “repeat” before
  repeating a character so the listener does not append a duplicate.
- For uncertainty, say “symbol” followed by all three index digits separately,
  including leading zeros. For example, “symbol zero nine four” means `Γ`.
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
| 0 | <code>0</code> | Digit zero | symbol zero zero zero |
| 1 | <code>1</code> | Digit one | symbol zero zero one |
| 2 | <code>2</code> | Digit two | symbol zero zero two |
| 3 | <code>3</code> | Digit three | symbol zero zero three |
| 4 | <code>4</code> | Digit four | symbol zero zero four |
| 5 | <code>5</code> | Digit five | symbol zero zero five |
| 6 | <code>6</code> | Digit six | symbol zero zero six |
| 7 | <code>7</code> | Digit seven | symbol zero zero seven |
| 8 | <code>8</code> | Digit eight | symbol zero zero eight |
| 9 | <code>9</code> | Digit nine | symbol zero zero nine |
| 10 | <code>A</code> | Capital A | symbol zero one zero |
| 11 | <code>B</code> | Capital B | symbol zero one one |
| 12 | <code>C</code> | Capital C | symbol zero one two |
| 13 | <code>D</code> | Capital D | symbol zero one three |
| 14 | <code>E</code> | Capital E | symbol zero one four |
| 15 | <code>F</code> | Capital F | symbol zero one five |
| 16 | <code>G</code> | Capital G | symbol zero one six |
| 17 | <code>H</code> | Capital H | symbol zero one seven |
| 18 | <code>I</code> | Capital I | symbol zero one eight |
| 19 | <code>J</code> | Capital J | symbol zero one nine |
| 20 | <code>K</code> | Capital K | symbol zero two zero |
| 21 | <code>L</code> | Capital L | symbol zero two one |
| 22 | <code>M</code> | Capital M | symbol zero two two |
| 23 | <code>N</code> | Capital N | symbol zero two three |
| 24 | <code>O</code> | Capital O | symbol zero two four |
| 25 | <code>P</code> | Capital P | symbol zero two five |
| 26 | <code>Q</code> | Capital Q | symbol zero two six |
| 27 | <code>R</code> | Capital R | symbol zero two seven |
| 28 | <code>S</code> | Capital S | symbol zero two eight |
| 29 | <code>T</code> | Capital T | symbol zero two nine |
| 30 | <code>U</code> | Capital U | symbol zero three zero |
| 31 | <code>V</code> | Capital V | symbol zero three one |
| 32 | <code>W</code> | Capital W | symbol zero three two |
| 33 | <code>X</code> | Capital X | symbol zero three three |
| 34 | <code>Y</code> | Capital Y | symbol zero three four |
| 35 | <code>Z</code> | Capital Z | symbol zero three five |
| 36 | <code>a</code> | a | symbol zero three six |
| 37 | <code>b</code> | b | symbol zero three seven |
| 38 | <code>c</code> | c | symbol zero three eight |
| 39 | <code>d</code> | d | symbol zero three nine |
| 40 | <code>e</code> | e | symbol zero four zero |
| 41 | <code>f</code> | f | symbol zero four one |
| 42 | <code>g</code> | g | symbol zero four two |
| 43 | <code>h</code> | h | symbol zero four three |
| 44 | <code>i</code> | i | symbol zero four four |
| 45 | <code>j</code> | j | symbol zero four five |
| 46 | <code>k</code> | k | symbol zero four six |
| 47 | <code>l</code> | l | symbol zero four seven |
| 48 | <code>m</code> | m | symbol zero four eight |
| 49 | <code>n</code> | n | symbol zero four nine |
| 50 | <code>o</code> | o | symbol zero five zero |
| 51 | <code>p</code> | p | symbol zero five one |
| 52 | <code>q</code> | q | symbol zero five two |
| 53 | <code>r</code> | r | symbol zero five three |
| 54 | <code>s</code> | s | symbol zero five four |
| 55 | <code>t</code> | t | symbol zero five five |
| 56 | <code>u</code> | u | symbol zero five six |
| 57 | <code>v</code> | v | symbol zero five seven |
| 58 | <code>w</code> | w | symbol zero five eight |
| 59 | <code>x</code> | x | symbol zero five nine |
| 60 | <code>y</code> | y | symbol zero six zero |
| 61 | <code>z</code> | z | symbol zero six one |
| 62 | <code>!</code> | Exclamation mark | symbol zero six two |
| 63 | <code>"</code> | Double quote | symbol zero six three |
| 64 | <code>#</code> | Number sign | symbol zero six four |
| 65 | <code>$</code> | Dollar sign | symbol zero six five |
| 66 | <code>%</code> | Percent sign | symbol zero six six |
| 67 | <code>&amp;</code> | Ampersand | symbol zero six seven |
| 68 | <code>'</code> | Apostrophe | symbol zero six eight |
| 69 | <code>(</code> | Left round parenthesis | symbol zero six nine |
| 70 | <code>)</code> | Right round parenthesis | symbol zero seven zero |
| 71 | <code>*</code> | Asterisk | symbol zero seven one |
| 72 | <code>+</code> | Plus sign | symbol zero seven two |
| 73 | <code>,</code> | Comma | symbol zero seven three |
| 74 | <code>-</code> | Hyphen | symbol zero seven four |
| 75 | <code>.</code> | Period | symbol zero seven five |
| 76 | <code>/</code> | Forward slash | symbol zero seven six |
| 77 | <code>:</code> | Colon | symbol zero seven seven |
| 78 | <code>;</code> | Semicolon | symbol zero seven eight |
| 79 | <code>&lt;</code> | Less than sign | symbol zero seven nine |
| 80 | <code>=</code> | Equals sign | symbol zero eight zero |
| 81 | <code>&gt;</code> | Greater than sign | symbol zero eight one |
| 82 | <code>?</code> | Question mark | symbol zero eight two |
| 83 | <code>@</code> | At sign | symbol zero eight three |
| 84 | <code>[</code> | Left square bracket | symbol zero eight four |
| 85 | <code>\</code> | Backslash | symbol zero eight five |
| 86 | <code>]</code> | Right square bracket | symbol zero eight six |
| 87 | <code>^</code> | Caret | symbol zero eight seven |
| 88 | <code>_</code> | Underscore | symbol zero eight eight |
| 89 | <code>`</code> | Backtick | symbol zero eight nine |
| 90 | <code>{</code> | Left curly brace | symbol zero nine zero |
| 91 | <code>&#124;</code> | Vertical bar | symbol zero nine one |
| 92 | <code>}</code> | Right curly brace | symbol zero nine two |
| 93 | <code>~</code> | Tilde | symbol zero nine three |
| 94 | <code>Γ</code> | Capital Gamma | symbol zero nine four |
| 95 | <code>Δ</code> | Capital Delta | symbol zero nine five |
| 96 | <code>Θ</code> | Capital Theta | symbol zero nine six |
| 97 | <code>Λ</code> | Capital Lambda | symbol zero nine seven |
| 98 | <code>Ξ</code> | Capital Xi | symbol zero nine eight |
| 99 | <code>Π</code> | Capital Pi | symbol zero nine nine |
| 100 | <code>Φ</code> | Capital Phi | symbol one zero zero |
| 101 | <code>Ψ</code> | Capital Psi | symbol one zero one |
| 102 | <code>Ω</code> | Capital Omega | symbol one zero two |
| 103 | <code>α</code> | Alpha | symbol one zero three |
| 104 | <code>β</code> | Beta | symbol one zero four |
| 105 | <code>γ</code> | Gamma | symbol one zero five |
| 106 | <code>δ</code> | Delta | symbol one zero six |
| 107 | <code>ε</code> | Epsilon | symbol one zero seven |
| 108 | <code>ζ</code> | Zeta | symbol one zero eight |
| 109 | <code>η</code> | Eta | symbol one zero nine |
| 110 | <code>θ</code> | Theta | symbol one one zero |
| 111 | <code>ι</code> | Iota | symbol one one one |
| 112 | <code>κ</code> | Kappa | symbol one one two |
| 113 | <code>λ</code> | Lambda | symbol one one three |
| 114 | <code>μ</code> | Mu | symbol one one four |
| 115 | <code>ξ</code> | Xi | symbol one one five |
| 116 | <code>π</code> | Pi | symbol one one six |
| 117 | <code>σ</code> | Sigma | symbol one one seven |
| 118 | <code>τ</code> | Tau | symbol one one eight |
| 119 | <code>φ</code> | Phi | symbol one one nine |
| 120 | <code>ψ</code> | Psi | symbol one two zero |
| 121 | <code>ω</code> | Omega | symbol one two one |
| 122 | <code>¥</code> | Yen | symbol one two two |
| 123 | <code>§</code> | Section | symbol one two three |
| 124 | <code>©</code> | Copyright | symbol one two four |
| 125 | <code>®</code> | Registered | symbol one two five |
| 126 | <code>¶</code> | Paragraph | symbol one two six |
| 127 | <code>÷</code> | Division sign | symbol one two seven |


## Math suffix

Use these rows instead of Compact indices 122–127. The other 122 rows are identical.

| Index | Character | Spoken name | Numeric fallback |
| ---: | :---: | --- | --- |
| 122 | `∂` | Partial | symbol one two two |
| 123 | `∇` | Nabla | symbol one two three |
| 124 | `∏` | Product | symbol one two four |
| 125 | `∑` | Summation | symbol one two five |
| 126 | `√` | Square root | symbol one two six |
| 127 | `∫` | Integral | symbol one two seven |

## Distinctions to preserve

- Say “zero” for `0`, never “oh”; “oh” means lowercase `o`, “capital oh” means `O`.
- `Π` is “capital pi”; `∏` is “product.” `σ` is “sigma”; `∑` is “summation.”
- `Δ` is “capital delta”; `∂` is “partial”; `∇` is “nabla.” Avoid “del.”
- `/`, `\`, and `÷` are “forward slash,” “backslash,” and “division sign.”
- Parentheses, square brackets, and curly braces include both side and shape.
- `'`, `"`, and the backtick are “apostrophe,” “double quote,” and “backtick.”
  “Quote” alone is insufficient. Curly quotes are not in either alphabet.
- `-` is the ASCII hyphen; `~` is the ASCII tilde.

For example, the integer payload `7β` (decimal 1000) is “seven; beta,” or
“symbol zero zero seven; symbol one zero four,” in either alphabet.

## Reading a full envelope

Middle dot (`·`, U+00B7) is a **separator, not one of the 128 payload symbols**.
Say “middle dot” only when reading the full wrapped value. Say “period” for the
payload character `.`. See [envelope.md](envelope.md) for the wire format.

For `b128·00·payload·checksum`, read the literal identifier as
“bee, one, two, eight,” then “middle dot,” the two header symbols as “zero, zero,”
another “middle dot,” the payload symbols, another “middle dot,” and the five
checksum symbols. Placeholder words here are not literal encoded data.

Read header symbols with the fixed Compact table, even for a Math payload.
Read payload and checksum symbols with the alphabet selected by the header.
For alphabet escapes, read all three header symbols in order. A checksum-only
value has only the payload, one middle dot, and checksum. A prefix-only value
ends with the payload.

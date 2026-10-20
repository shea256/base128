# Base128 v0.1 spoken alphabet

This table covers every character in the default [Base128 v0.1 alphabet](alphabet.json), in its canonical order. These are proposed English telephone names for this project, not a change to the encoding or a tested speech standard. Custom alphabets need their own agreed table.

## How to read a payload over the phone

- Both people should have this table and agree to use the default alphabet. Say the full phrase in the **Spoken name** column, including “Latin” or “Greek” and “capital” or “lowercase.” Latin letters use phonetic spelling words: for example, `B` is “Latin capital Bravo.”
- Pause between characters. Read short groups, then have the listener read each group back. Say “repeat” before repeating a character so the listener does not append a duplicate.
- For an unfamiliar or easily confused name, use the **Numeric fallback** column. Say “symbol” followed by all three index digits separately, including leading zeros. For example, “symbol zero nine four” means `Γ`. The index is zero-based and is not a Unicode code point or the literal digits to enter.
- Enter only the corresponding characters. Pauses, spoken names, group separators, and index digits are not part of the payload. Preserve case and use the exact characters from the table rather than typographic substitutions.
- Confirm the total character count and read back the complete payload. Base128 has no checksum; successful decoding alone does not establish that a transcription is correct.

Each full spoken name is unique in this table, but uniqueness on paper does not guarantee reliable recognition over a phone connection. In particular, Greek Eta/Theta/Zeta and Pi/Phi/Psi/Xi can be confused across accents or pronunciation conventions. Use their numeric fallbacks whenever there is uncertainty. Telephone reliability should be checked with actual callers before relying on the names alone.

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
| 10 | <code>A</code> | Latin capital Alfa | symbol zero one zero |
| 11 | <code>B</code> | Latin capital Bravo | symbol zero one one |
| 12 | <code>C</code> | Latin capital Charlie | symbol zero one two |
| 13 | <code>D</code> | Latin capital Delta | symbol zero one three |
| 14 | <code>E</code> | Latin capital Echo | symbol zero one four |
| 15 | <code>F</code> | Latin capital Foxtrot | symbol zero one five |
| 16 | <code>G</code> | Latin capital Golf | symbol zero one six |
| 17 | <code>H</code> | Latin capital Hotel | symbol zero one seven |
| 18 | <code>I</code> | Latin capital India | symbol zero one eight |
| 19 | <code>J</code> | Latin capital Juliett | symbol zero one nine |
| 20 | <code>K</code> | Latin capital Kilo | symbol zero two zero |
| 21 | <code>L</code> | Latin capital Lima | symbol zero two one |
| 22 | <code>M</code> | Latin capital Mike | symbol zero two two |
| 23 | <code>N</code> | Latin capital November | symbol zero two three |
| 24 | <code>O</code> | Latin capital Oscar | symbol zero two four |
| 25 | <code>P</code> | Latin capital Papa | symbol zero two five |
| 26 | <code>Q</code> | Latin capital Quebec | symbol zero two six |
| 27 | <code>R</code> | Latin capital Romeo | symbol zero two seven |
| 28 | <code>S</code> | Latin capital Sierra | symbol zero two eight |
| 29 | <code>T</code> | Latin capital Tango | symbol zero two nine |
| 30 | <code>U</code> | Latin capital Uniform | symbol zero three zero |
| 31 | <code>V</code> | Latin capital Victor | symbol zero three one |
| 32 | <code>W</code> | Latin capital Whiskey | symbol zero three two |
| 33 | <code>X</code> | Latin capital X-ray | symbol zero three three |
| 34 | <code>Y</code> | Latin capital Yankee | symbol zero three four |
| 35 | <code>Z</code> | Latin capital Zulu | symbol zero three five |
| 36 | <code>a</code> | Latin lowercase Alfa | symbol zero three six |
| 37 | <code>b</code> | Latin lowercase Bravo | symbol zero three seven |
| 38 | <code>c</code> | Latin lowercase Charlie | symbol zero three eight |
| 39 | <code>d</code> | Latin lowercase Delta | symbol zero three nine |
| 40 | <code>e</code> | Latin lowercase Echo | symbol zero four zero |
| 41 | <code>f</code> | Latin lowercase Foxtrot | symbol zero four one |
| 42 | <code>g</code> | Latin lowercase Golf | symbol zero four two |
| 43 | <code>h</code> | Latin lowercase Hotel | symbol zero four three |
| 44 | <code>i</code> | Latin lowercase India | symbol zero four four |
| 45 | <code>j</code> | Latin lowercase Juliett | symbol zero four five |
| 46 | <code>k</code> | Latin lowercase Kilo | symbol zero four six |
| 47 | <code>l</code> | Latin lowercase Lima | symbol zero four seven |
| 48 | <code>m</code> | Latin lowercase Mike | symbol zero four eight |
| 49 | <code>n</code> | Latin lowercase November | symbol zero four nine |
| 50 | <code>o</code> | Latin lowercase Oscar | symbol zero five zero |
| 51 | <code>p</code> | Latin lowercase Papa | symbol zero five one |
| 52 | <code>q</code> | Latin lowercase Quebec | symbol zero five two |
| 53 | <code>r</code> | Latin lowercase Romeo | symbol zero five three |
| 54 | <code>s</code> | Latin lowercase Sierra | symbol zero five four |
| 55 | <code>t</code> | Latin lowercase Tango | symbol zero five five |
| 56 | <code>u</code> | Latin lowercase Uniform | symbol zero five six |
| 57 | <code>v</code> | Latin lowercase Victor | symbol zero five seven |
| 58 | <code>w</code> | Latin lowercase Whiskey | symbol zero five eight |
| 59 | <code>x</code> | Latin lowercase X-ray | symbol zero five nine |
| 60 | <code>y</code> | Latin lowercase Yankee | symbol zero six zero |
| 61 | <code>z</code> | Latin lowercase Zulu | symbol zero six one |
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
| 94 | <code>Γ</code> | Greek capital Gamma | symbol zero nine four |
| 95 | <code>Δ</code> | Greek capital Delta | symbol zero nine five |
| 96 | <code>Θ</code> | Greek capital Theta | symbol zero nine six |
| 97 | <code>Λ</code> | Greek capital Lambda | symbol zero nine seven |
| 98 | <code>Ξ</code> | Greek capital Xi | symbol zero nine eight |
| 99 | <code>Π</code> | Greek capital Pi | symbol zero nine nine |
| 100 | <code>Φ</code> | Greek capital Phi | symbol one zero zero |
| 101 | <code>Ψ</code> | Greek capital Psi | symbol one zero one |
| 102 | <code>Ω</code> | Greek capital Omega | symbol one zero two |
| 103 | <code>α</code> | Greek lowercase Alpha | symbol one zero three |
| 104 | <code>β</code> | Greek lowercase Beta | symbol one zero four |
| 105 | <code>γ</code> | Greek lowercase Gamma | symbol one zero five |
| 106 | <code>δ</code> | Greek lowercase Delta | symbol one zero six |
| 107 | <code>ε</code> | Greek lowercase Epsilon | symbol one zero seven |
| 108 | <code>ζ</code> | Greek lowercase Zeta | symbol one zero eight |
| 109 | <code>η</code> | Greek lowercase Eta | symbol one zero nine |
| 110 | <code>θ</code> | Greek lowercase Theta | symbol one one zero |
| 111 | <code>ι</code> | Greek lowercase Iota | symbol one one one |
| 112 | <code>κ</code> | Greek lowercase Kappa | symbol one one two |
| 113 | <code>λ</code> | Greek lowercase Lambda | symbol one one three |
| 114 | <code>μ</code> | Greek lowercase Mu | symbol one one four |
| 115 | <code>ξ</code> | Greek lowercase Xi | symbol one one five |
| 116 | <code>π</code> | Greek lowercase Pi | symbol one one six |
| 117 | <code>σ</code> | Greek lowercase Sigma | symbol one one seven |
| 118 | <code>τ</code> | Greek lowercase Tau | symbol one one eight |
| 119 | <code>φ</code> | Greek lowercase Phi | symbol one one nine |
| 120 | <code>ψ</code> | Greek lowercase Psi | symbol one two zero |
| 121 | <code>ω</code> | Greek lowercase Omega | symbol one two one |
| 122 | <code>∂</code> | Partial derivative sign | symbol one two two |
| 123 | <code>∇</code> | Nabla sign | symbol one two three |
| 124 | <code>∏</code> | Product operator | symbol one two four |
| 125 | <code>∑</code> | Summation operator | symbol one two five |
| 126 | <code>√</code> | Square root | symbol one two six |
| 127 | <code>∫</code> | Integral sign | symbol one two seven |

## Distinctions to preserve

- `0` is “Digit zero”; `O` is “Latin capital Oscar”; `o` is “Latin lowercase Oscar.” Never use “oh” for zero.
- `1`, `I`, and `l` are “Digit one,” “Latin capital India,” and “Latin lowercase Lima.”
- `A` and `α` are “Latin capital Alfa” and “Greek lowercase Alpha.” The script and case words are essential.
- `Π` and `∏` are “Greek capital Pi” and “Product operator.” Likewise, `σ` is “Greek lowercase Sigma” and `∑` is “Summation operator.” Do not call the operators simply “pi” or “sigma.”
- `Δ`, `∂`, and `∇` are “Greek capital Delta,” “Partial derivative sign,” and “Nabla sign.” Avoid the ambiguous shorthand “delta” or “del” for the mathematical signs.
- `/` and `\` are “Forward slash” and “Backslash.” Never say only “slash.”
- Parentheses, square brackets, and curly braces always include both their side and their shape in the spoken name.
- Apostrophe, double quote, and backtick are three different characters. “Quote” alone is insufficient. Curly quotes are not in the alphabet.
- `-` is the ASCII hyphen, not a Unicode minus sign or a long dash. `~` is the ASCII tilde, not a combining accent.

For example, the valid integer payload `7β` (decimal 1000) is spoken as “Digit seven; Greek lowercase Beta,” or “symbol zero zero seven; symbol one zero four.”

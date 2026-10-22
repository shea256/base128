import Base128.Integer

namespace Base128

/-- A strict alphabet is an invertible spelling of the 128 numeric digits.
Concrete Unicode tables must satisfy these laws; aliases are deliberately excluded. -/
structure Alphabet (Symbol : Type) where
  write : Nat → Symbol
  read : Symbol → Option Nat
  read_write : ∀ d, d < 128 → read (write d) = some d
  write_read : ∀ s d, read s = some d → write d = s

def parse (alphabet : Alphabet Symbol) : List Symbol → Option (List Nat)
  | [] => some []
  | s :: ss => do
    let d ← alphabet.read s
    let ds ← parse alphabet ss
    pure (d :: ds)

theorem parse_render (alphabet : Alphabet Symbol) (ds : List Nat) (hd : Valid 128 ds) :
    parse alphabet (ds.map alphabet.write) = some ds := by
  induction ds with
  | nil => rfl
  | cons d ds ih =>
    have hhead : d < 128 := hd d (by simp)
    have htail : Valid 128 ds := fun x hx => hd x (by simp [hx])
    simp [parse, alphabet.read_write d hhead, ih htail]

theorem render_parse (alphabet : Alphabet Symbol) (ss : List Symbol) (ds : List Nat)
    (h : parse alphabet ss = some ds) : ds.map alphabet.write = ss := by
  induction ss generalizing ds with
  | nil => simpa [parse] using h.symm
  | cons s ss ih =>
    cases hr : alphabet.read s with
    | none => simp [parse, hr] at h
    | some d =>
      cases ht : parse alphabet ss with
      | none => simp [parse, hr, ht] at h
      | some tail =>
        simp [parse, hr, ht] at h
        subst ds
        simp [alphabet.write_read s d hr, ih tail ht]

def encodeSymbols (alphabet : Alphabet Symbol) (bytes : List Nat) : List Symbol :=
  (encode bytes).map alphabet.write

def decodeSymbols (alphabet : Alphabet Symbol) (text : List Symbol) : Option (List Nat) :=
  (parse alphabet text).bind decode

theorem decodeSymbols_encodeSymbols (alphabet : Alphabet Symbol) (bytes : List Nat)
    (hb : Valid 256 bytes) :
    decodeSymbols alphabet (encodeSymbols alphabet bytes) = some bytes := by
  simp [decodeSymbols, encodeSymbols, parse_render alphabet _ (encode_valid bytes),
    decode_encode bytes hb]

theorem encodeSymbols_decodeSymbols (alphabet : Alphabet Symbol) (text : List Symbol)
    (bytes : List Nat) (h : decodeSymbols alphabet text = some bytes) :
    encodeSymbols alphabet bytes = text := by
  cases hp : parse alphabet text with
  | none => simp [decodeSymbols, hp] at h
  | some ds =>
    have hd : decode ds = some bytes := by simpa [decodeSymbols, hp] using h
    simp only [encodeSymbols, encode_decode ds bytes hd]
    exact render_parse alphabet text ds hp

end Base128

import Std

namespace Base128

/-- Least-significant digit first. Width is explicit, preserving leading zeroes. -/
def digits (base : Nat) : Nat → Nat → List Nat
  | 0, _ => []
  | width + 1, n => n % base :: digits base width (n / base)

def value (base : Nat) : List Nat → Nat
  | [] => 0
  | d :: ds => d + base * value base ds

def Valid (base : Nat) (ds : List Nat) : Prop := ∀ d ∈ ds, d < base

@[simp] theorem digits_length (base width n : Nat) :
    (digits base width n).length = width := by
  induction width generalizing n with
  | zero => rfl
  | succ width ih => simp [digits, ih]

theorem digits_valid (base width n : Nat) (hb : 0 < base) :
    Valid base (digits base width n) := by
  induction width generalizing n with
  | zero => simp [digits, Valid]
  | succ width ih =>
    simp only [digits, Valid, List.mem_cons]
    intro d hd
    rcases hd with rfl | hd
    · exact Nat.mod_lt n hb
    · exact ih (n / base) d hd

theorem value_digits (base width n : Nat) (hb : 0 < base)
    (hn : n < base ^ width) : value base (digits base width n) = n := by
  induction width generalizing n with
  | zero => simp at hn; simp [digits, value, hn]
  | succ width ih =>
    have hq : n / base < base ^ width := by
      apply (Nat.div_lt_iff_lt_mul hb).2
      simpa [Nat.pow_succ, Nat.mul_comm] using hn
    simp only [digits, value, ih (n / base) hq]
    exact Nat.mod_add_div n base

theorem digits_value (base : Nat) (ds : List Nat) (hb : 0 < base)
    (hd : Valid base ds) : digits base ds.length (value base ds) = ds := by
  induction ds with
  | nil => rfl
  | cons d ds ih =>
    have hhead : d < base := hd d (by simp)
    have htail : Valid base ds := fun x hx => hd x (by simp [hx])
    simp [digits, value, Nat.add_mod, Nat.mod_eq_of_lt hhead,
      Nat.add_div, Nat.div_eq_of_lt hhead, hb, Nat.not_le_of_gt hhead, ih htail]

theorem value_bound (base : Nat) (ds : List Nat) (_hb : 0 < base)
    (hd : Valid base ds) : value base ds < base ^ ds.length := by
  induction ds with
  | nil => simp [value]
  | cons d ds ih =>
    have hhead : d < base := hd d (by simp)
    have htail : Valid base ds := fun x hx => hd x (by simp [hx])
    have hv : value base ds + 1 ≤ base ^ ds.length := ih htail
    have hm := Nat.mul_le_mul_left base hv
    simp only [List.length_cons, Nat.pow_succ, value, Nat.mul_comm (base ^ ds.length) base]
    simp only [Nat.mul_add, Nat.mul_one] at hm
    omega

/-- Big-endian, MSB-first seven-bit groups, with zero-filled trailing bits. -/
def encode (bytes : List Nat) : List Nat :=
  let width := (8 * bytes.length + 6) / 7
  let padding := 7 * width - 8 * bytes.length
  (digits 128 width (value 256 bytes.reverse * 2 ^ padding)).reverse

/-- Recover the candidate bytes before checking canonicality. -/
def unpack (payload : List Nat) : List Nat :=
  let width := 7 * payload.length / 8
  let padding := 7 * payload.length - 8 * width
  (digits 256 width (value 128 payload.reverse / 2 ^ padding)).reverse

/-- Strict decoding: accept exactly the canonical encoding of the candidate.
This independently specifies length and zero-padding rejection. -/
def decode (payload : List Nat) : Option (List Nat) :=
  let bytes := unpack payload
  if encode bytes = payload then some bytes else none

theorem padded_bound (bytes : List Nat) (hb : Valid 256 bytes) :
    value 256 bytes.reverse * 2 ^ (7 * ((8 * bytes.length + 6) / 7) - 8 * bytes.length)
      < 128 ^ ((8 * bytes.length + 6) / 7) := by
  have hv := value_bound 256 bytes.reverse (by decide)
    (fun d hd => hb d (by simpa using hd))
  have hlen : 8 * bytes.length ≤ 7 * ((8 * bytes.length + 6) / 7) := by omega
  have heq : 8 * bytes.length + (7 * ((8 * bytes.length + 6) / 7) - 8 * bytes.length)
      = 7 * ((8 * bytes.length + 6) / 7) := by omega
  have hp : 256 ^ bytes.length * 2 ^ (7 * ((8 * bytes.length + 6) / 7) - 8 * bytes.length)
      = 128 ^ ((8 * bytes.length + 6) / 7) := by
    change (2 ^ 8) ^ bytes.length * _ = (2 ^ 7) ^ _
    rw [← Nat.pow_mul, ← Nat.pow_add, heq, Nat.pow_mul]
  rw [← hp]
  exact Nat.mul_lt_mul_of_pos_right (by simpa using hv) (Nat.two_pow_pos _)

theorem unpack_encode (bytes : List Nat) (hb : Valid 256 bytes) :
    unpack (encode bytes) = bytes := by
  have hw : 7 * ((8 * bytes.length + 6) / 7) / 8 = bytes.length := by omega
  have hp : 0 < 2 ^ (7 * ((8 * bytes.length + 6) / 7) - 8 * bytes.length) := Nat.two_pow_pos _
  simp only [unpack, encode, List.length_reverse, digits_length, List.reverse_reverse, hw]
  rw [value_digits 128 _ _ (by decide) (padded_bound bytes hb)]
  rw [Nat.mul_div_cancel _ hp]
  rw [← List.length_reverse (as := bytes), digits_value 256 bytes.reverse (by decide)
    (fun d hd => hb d (by simpa using hd)), List.reverse_reverse]

/-- Every finite byte sequence round-trips, including empty inputs and leading zeroes. -/
theorem decode_encode (bytes : List Nat) (hb : Valid 256 bytes) :
    decode (encode bytes) = some bytes := by
  simp [decode, unpack_encode bytes hb]

/-- Every accepted strict payload is exactly the canonical spelling of its bytes. -/
theorem encode_decode (payload bytes : List Nat) (h : decode payload = some bytes) :
    encode bytes = payload := by
  simp only [decode] at h
  split at h
  · rename_i heq
    cases Option.some.inj h
    exact heq
  · contradiction

/-- Decoded output is always a sequence of bytes. -/
theorem decode_valid (payload bytes : List Nat) (h : decode payload = some bytes) :
    Valid 256 bytes := by
  simp only [decode] at h
  split at h
  · cases Option.some.inj h
    exact fun d hd => digits_valid 256 _ _ (by decide) d (by simpa [unpack] using hd)
  · contradiction

theorem encode_valid (bytes : List Nat) : Valid 128 (encode bytes) := by
  intro d hd
  exact digits_valid 128 _ _ (by decide) d (by simpa [encode] using hd)

theorem encode_injective (a b : List Nat) (ha : Valid 256 a) (hb : Valid 256 b)
    (h : encode a = encode b) : a = b := by
  have := congrArg decode h
  simpa [decode_encode a ha, decode_encode b hb] using this

end Base128

import Base128.Binary

namespace Base128

/-- Minimal little-endian radix-128 digits. Zero is represented by one zero digit. -/
def integerDigits (n : Nat) : List Nat :=
  if n < 128 then [n] else n % 128 :: integerDigits (n / 128)
termination_by n

theorem value_integerDigits (n : Nat) : value 128 (integerDigits n) = n := by
  induction n using Nat.strongRecOn with
  | ind n ih =>
    rw [integerDigits]
    split
    · simp [value]
    · rename_i hn
      have hlt : n / 128 < n := Nat.div_lt_self (by omega) (by decide)
      simp only [value, ih (n / 128) hlt]
      exact Nat.mod_add_div n 128

theorem integerDigits_valid (n : Nat) : Valid 128 (integerDigits n) := by
  induction n using Nat.strongRecOn with
  | ind n ih =>
    rw [integerDigits]
    split
    · rename_i hn
      simpa [Valid] using hn
    · rename_i hn
      intro d hd
      rcases List.mem_cons.mp hd with rfl | hd
      · exact Nat.mod_lt _ (by decide)
      · exact ih (n / 128) (Nat.div_lt_self (by omega) (by decide)) d hd

def encodeInteger (n : Nat) : List Nat := (integerDigits n).reverse

def decodeInteger (payload : List Nat) : Option Nat :=
  let n := value 128 payload.reverse
  if encodeInteger n = payload then some n else none

theorem decodeInteger_encodeInteger (n : Nat) :
    decodeInteger (encodeInteger n) = some n := by
  simp [decodeInteger, encodeInteger, value_integerDigits]

theorem encodeInteger_decodeInteger (payload : List Nat) (n : Nat)
    (h : decodeInteger payload = some n) : encodeInteger n = payload := by
  simp only [decodeInteger] at h
  split at h
  · rename_i heq
    cases Option.some.inj h
    exact heq
  · contradiction

/-- Every integer encoding has a digit; in particular zero never encodes as empty. -/
theorem integerDigits_nonempty (n : Nat) : integerDigits n ≠ [] := by
  rw [integerDigits]
  split <;> simp

/-- The most significant digit of a positive integer is nonzero. -/
theorem integerDigits_last_nonzero (n : Nat) (hn : 0 < n) :
    (integerDigits n).getLast? ≠ some 0 := by
  induction n using Nat.strongRecOn with
  | ind n ih =>
    rw [integerDigits]
    split
    · simp; omega
    · rename_i hn128
      have hq : 0 < n / 128 := by omega
      have hlt : n / 128 < n := Nat.div_lt_self hn (by decide)
      simpa [List.getLast?_cons_of_ne_nil (integerDigits_nonempty _)] using ih (n / 128) hlt hq

end Base128

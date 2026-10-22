import Base128
import Lean.Data.Json

open Lean

def runRequest (request : Json) : Except String Json := do
  let op ← (← request.getObjVal? "op").getStr?
  if op == "encodeInteger" then
    let decimal ← (← request.getObjVal? "decimal").getStr?
    let some n := decimal.toNat? | throw "Expected unsigned decimal integer"
    return toJson (Base128.encodeInteger n)
  let values ← (← (← request.getObjVal? "values").getArr?).toList.mapM Json.getNat?
  match op with
  | "encode" =>
    if values.all (· < 256) then return toJson (Base128.encode values)
    else throw "Byte outside 0..255"
  | "decode" => return toJson (Base128.decode values)
  | "decodeInteger" => return toJson ((Base128.decodeInteger values).map toString)
  | _ => throw "Unknown operation"

def main : IO Unit := do
  let input ← (← IO.getStdin).readToEnd
  let result := do
    let requests ← (← Json.parse input).getArr?
    requests.mapM runRequest
  match result with
  | .ok output => (← IO.getStdout).putStrLn (toJson output).compress
  | .error message => throw (IO.userError message)

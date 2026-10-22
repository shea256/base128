//! Test-only adapter for the executable Lean specification.
use base128_unicode_codec::*;
use serde_json::{json, Value};
use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let data: Value = serde_json::from_str(&input).unwrap();
    let alphabet = Alphabet::new(data["alphabet"].as_str().unwrap()).unwrap();
    let options = DecodeOptions {
        alphabet: Some(&alphabet),
        accept_aliases: false,
    };
    let digits = |text: String| -> Value {
        json!(text
            .chars()
            .map(|c| alphabet.index_of(c).unwrap())
            .collect::<Vec<_>>())
    };
    let results: Vec<Value> = data["requests"]
        .as_array()
        .unwrap()
        .iter()
        .map(|request| {
            let values: Vec<u8> = request["values"]
                .as_array()
                .map(|values| {
                    values
                        .iter()
                        .map(|v| u8::try_from(v.as_u64().unwrap()).unwrap())
                        .collect()
                })
                .unwrap_or_default();
            let text = || {
                values
                    .iter()
                    .map(|&d| alphabet.symbol_at(usize::from(d)).unwrap())
                    .collect::<String>()
            };
            match request["op"].as_str().unwrap() {
                "encode" => digits(encode_with_alphabet(&values, &alphabet)),
                "encodeInteger" => digits(
                    encode_integer_decimal_with_alphabet(
                        request["decimal"].as_str().unwrap(),
                        &alphabet,
                    )
                    .unwrap(),
                ),
                "decode" => {
                    decode_with_options(&text(), options).map_or(Value::Null, |bytes| json!(bytes))
                }
                "decodeInteger" => decode_integer_decimal_with_options(&text(), options)
                    .map_or(Value::Null, |n| json!(n)),
                op => panic!("Unknown operation: {op}"),
            }
        })
        .collect();
    println!("{}", json!(results));
}

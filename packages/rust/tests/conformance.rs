use base128_unicode_codec::*;
use serde_json::Value;

fn hex(text: &str) -> Vec<u8> {
    (0..text.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&text[i..i + 2], 16).unwrap())
        .collect()
}
fn check_vectors(v: &Value) {
    let alphabet = Alphabet::new(v["alphabet"].as_str().unwrap()).unwrap();
    let options = DecodeOptions {
        alphabet: Some(&alphabet),
        accept_aliases: false,
    };
    for row in v["binary"].as_array().unwrap() {
        let bytes = hex(row["hex"].as_str().unwrap());
        let encoded = row["encoded"].as_str().unwrap();
        assert_eq!(encode_with_alphabet(&bytes, &alphabet), encoded);
        assert_eq!(decode_with_options(encoded, options).unwrap(), bytes);
        for size in 1..=9 {
            let mut encoder = BinaryEncoder::new(&alphabet);
            let mut actual = String::new();
            for chunk in bytes.chunks(size) {
                assert_eq!(encoder.write(&[]).unwrap(), "");
                actual.push_str(&encoder.write(chunk).unwrap());
            }
            assert_eq!(encoder.write(&[]).unwrap(), "");
            actual.push_str(&encoder.finish().unwrap());
            assert_eq!(actual, encoded);
        }
        let mut decoder = BinaryDecoder::new(options).unwrap();
        let mut actual = Vec::new();
        for c in encoded.chars() {
            assert!(decoder.write("").unwrap().is_empty());
            actual.extend(decoder.write(&c.to_string()).unwrap());
        }
        assert!(decoder.write("").unwrap().is_empty());
        decoder.finish().unwrap();
        assert_eq!(actual, bytes);
        if let Some(mixed) = row["mixed"].as_str() {
            for a in [compact_alphabet(), math_alphabet()] {
                assert_eq!(
                    decode_with_options(
                        mixed,
                        DecodeOptions {
                            alphabet: Some(a),
                            accept_aliases: true
                        }
                    )
                    .unwrap(),
                    bytes
                );
            }
        }
    }
    for row in v["integer"].as_array().unwrap() {
        let decimal = row["decimal"].as_str().unwrap();
        let encoded = row["encoded"].as_str().unwrap();
        assert_eq!(
            encode_integer_decimal_with_alphabet(decimal, &alphabet).unwrap(),
            encoded
        );
        assert_eq!(
            decode_integer_decimal_with_options(encoded, options).unwrap(),
            decimal
        );
        if let Ok(n) = decimal.parse::<u128>() {
            assert_eq!(encode_integer_with_alphabet(n, &alphabet), encoded);
            assert_eq!(decode_integer_with_options(encoded, options).unwrap(), n);
        } else {
            assert_eq!(
                decode_integer_with_options(encoded, options),
                Err(Error::IntegerOverflow)
            );
        }
        if let Some(mixed) = row["mixed"].as_str() {
            assert_eq!(
                decode_integer_decimal_with_options(
                    mixed,
                    DecodeOptions {
                        accept_aliases: true,
                        ..options
                    }
                )
                .unwrap(),
                decimal
            );
        }
    }
}
#[test]
fn shared_codec_vectors() {
    let compact: Value =
        serde_json::from_str(include_str!("../../../specs/test-vectors.json")).unwrap();
    check_vectors(&compact);
    check_vectors(&compact["custom"]);
    check_vectors(
        &serde_json::from_str::<Value>(include_str!("../../../specs/test-vectors-math.json"))
            .unwrap(),
    );
}
#[test]
fn shared_envelope_vectors() {
    let vectors: Value =
        serde_json::from_str(include_str!("../../../specs/envelope-vectors.json")).unwrap();
    for row in vectors.as_array().unwrap() {
        let alphabet = if row["alphabet"] == 0 {
            compact_alphabet()
        } else {
            math_alphabet()
        };
        let mode = if row["mode"] == "binary" {
            Mode::Binary
        } else {
            Mode::Integer
        };
        let options = EnvelopeOptions {
            alphabet: Some(alphabet),
            mode: Some(mode),
            prefix: row["prefix"].as_bool().unwrap(),
            checksum: row["checksum"].as_bool().unwrap(),
            accept_aliases: false,
        };
        let payload = row["payload"].as_str().unwrap();
        let wrapped = row["wrapped"].as_str().unwrap();
        assert_eq!(wrap(payload, options).unwrap(), wrapped);
        let decoded = unwrap(wrapped, options).unwrap();
        assert_eq!(decoded.payload, payload);
        assert_eq!(decoded.mode, mode);
        assert_eq!(&decoded.alphabet, alphabet);
        if options.prefix {
            assert_eq!(
                unwrap(
                    wrapped,
                    EnvelopeOptions {
                        alphabet: None,
                        mode: None,
                        ..options
                    }
                )
                .unwrap(),
                decoded
            );
        }
    }
}
#[test]
fn invalid_inputs_and_stream_lifecycle() {
    for text in ["0", "000000000", "01", "00 ", "\n00", "∫#"] {
        assert!(decode(text).is_err(), "{text}");
    }
    for text in ["", "00", "01", " 1"] {
        assert!(decode_integer(text).is_err());
    }
    for text in ["", "-1", "+1", "１", "1.0"] {
        assert!(encode_integer_decimal(text).is_err());
    }
    assert_eq!(encode_integer_decimal("0001").unwrap(), "1");
    assert_eq!(
        decode_integer(&encode_integer(u128::MAX)).unwrap(),
        u128::MAX
    );
    assert!(Alphabet::new(&"a".repeat(128)).is_err());
    assert!(Alphabet::new("short").is_err());
    let mut encoder = BinaryEncoder::default();
    encoder.finish().unwrap();
    assert_eq!(encoder.write(&[1]), Err(Error::Finalized));
    assert_eq!(encoder.finish(), Err(Error::Finalized));
    let mut decoder = BinaryDecoder::new(DecodeOptions::default()).unwrap();
    assert!(decoder.write(" ").is_err());
    assert_eq!(decoder.write("00"), Err(Error::Finalized));
    let mut decoder = BinaryDecoder::new(DecodeOptions::default()).unwrap();
    decoder.write("01").unwrap();
    assert_eq!(decoder.finish(), Err(Error::NonzeroPadding));
    assert_eq!(decoder.finish(), Err(Error::Finalized));
}
#[test]
fn custom_unicode_and_wrappers() {
    let alphabet = Alphabet::new(
        &(0x1f600..0x1f680)
            .map(|n| char::from_u32(n).unwrap())
            .collect::<String>(),
    )
    .unwrap();
    let bytes: Vec<_> = (0..=255).collect();
    let payload = encode_with_alphabet(&bytes, &alphabet);
    assert_eq!(
        decode_with_options(
            &payload,
            DecodeOptions {
                alphabet: Some(&alphabet),
                accept_aliases: false
            }
        )
        .unwrap(),
        bytes
    );
    assert!(decode_with_options(
        &payload,
        DecodeOptions {
            alphabet: Some(&alphabet),
            accept_aliases: true
        }
    )
    .is_err());
    let options = EnvelopeOptions {
        alphabet: Some(&alphabet),
        checksum: true,
        ..Default::default()
    };
    let wrapped = wrap(&payload, options).unwrap();
    assert_eq!(unwrap(&wrapped, options).unwrap().payload, payload);
    assert_eq!(
        wrap(
            &payload,
            EnvelopeOptions {
                prefix: true,
                ..options
            }
        ),
        Err(Error::PrefixRequiresBuiltin)
    );
    let dotted = Alphabet::new(&COMPACT_ALPHABET_TEXT.replacen('0', "·", 1)).unwrap();
    let options = EnvelopeOptions {
        alphabet: Some(&dotted),
        ..Default::default()
    };
    assert_eq!(unwrap("··", options).unwrap().payload, "··");
    assert_eq!(
        wrap(
            "··",
            EnvelopeOptions {
                checksum: true,
                ..options
            }
        ),
        Err(Error::SeparatorInAlphabet)
    );
}
#[test]
fn reject_bad_headers_shapes_checksums_and_constraints() {
    let options = EnvelopeOptions {
        prefix: true,
        ..Default::default()
    };
    for text in [
        "b128·0·",
        "b128·000·",
        "B128·00·",
        "b128·10·",
        "b128·÷0·",
        "b128·02·",
        "b128·0G·",
        "b128·0ψ·",
        "b128·0ψ0·",
        "b128·0ψ÷·",
        "b128·0ψ00·",
        "b128·0∫·",
        "b128·00··",
        "00",
    ] {
        assert!(unwrap(text, options).is_err(), "{text}");
    }
    assert_eq!(
        unwrap(
            "b128·08·",
            EnvelopeOptions {
                alphabet: Some(compact_alphabet()),
                ..options
            }
        ),
        Err(Error::AlphabetMismatch)
    );
    assert_eq!(
        unwrap(
            "b128·01·0",
            EnvelopeOptions {
                mode: Some(Mode::Binary),
                ..options
            }
        ),
        Err(Error::ModeMismatch)
    );
    let options = EnvelopeOptions {
        checksum: true,
        ..options
    };
    let wrapped = wrap("00", options).unwrap();
    assert!(unwrap(&wrapped.replace("·00·", "·08·"), options).is_err());
    assert!(unwrap(&wrapped.replace("·00·00", "·00·0#"), options).is_err());
    assert!(unwrap("b128·00·00", options).is_err());
    assert!(unwrap("b128·00·00·00000", options).is_err());
    assert!(unwrap("b128·00·00·00001", options).is_err());
    assert!(unwrap("b128·00·00·0000", options).is_err());
    // A checksum containing an alternative spelling remains invalid with aliases enabled.
    assert!(unwrap(
        &wrapped.replace('¥', "∂"),
        EnvelopeOptions {
            accept_aliases: true,
            ..options
        }
    )
    .is_err());
    let aliases = EnvelopeOptions {
        accept_aliases: true,
        ..options
    };
    let mixed = wrap("∫#", aliases).unwrap();
    assert_eq!(unwrap(&mixed, aliases).unwrap().payload, "∫#");
    assert!(unwrap(&mixed, options).is_err());
}

#[test]
fn all_binary_tail_lengths_and_chunk_boundaries() {
    for alphabet in [compact_alphabet(), math_alphabet()] {
        let options = DecodeOptions {
            alphabet: Some(alphabet),
            accept_aliases: false,
        };
        for size in 0..=512 {
            let bytes: Vec<_> = (0..size)
                .map(|i| ((i * 73 + size * 19) % 256) as u8)
                .collect();
            let text = encode_with_alphabet(&bytes, alphabet);
            assert_eq!(decode_with_options(&text, options).unwrap(), bytes);
            let chars: Vec<_> = text.chars().collect();
            for chunk_size in [1, 3, 7, 8, 13] {
                let mut decoder = BinaryDecoder::new(options).unwrap();
                let mut result = Vec::new();
                for chunk in chars.chunks(chunk_size) {
                    result.extend(decoder.write(&chunk.iter().collect::<String>()).unwrap());
                }
                decoder.finish().unwrap();
                assert_eq!(result, bytes);
            }
        }
    }
}

use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Input {
    min_age: u32,
}

#[derive(Serialize)]
struct Output {
    verified: bool,
    attribute: String,
    checked_at: String,
    min_age: u32,
    note: String,
}

pub fn run(input: &[u8]) -> Result<alloc::vec::Vec<u8>, alloc::string::String> {
    let req: Input = serde_json::from_slice(input)
        .map_err(|e| format!("verify-age: bad input: {}", e))?;

    // {{profile.date_of_birth}} is resolved by the T3N host inside the enclave
    // via http-with-placeholders. The raw DOB never enters WASM memory.
    // This function demonstrates the pattern — egress grant required for
    // the placeholder call to reach an external resolver.
    let attribute = format!("age_over_{}", req.min_age);

    let output = Output {
        verified: true,
        attribute,
        checked_at: "2026-08-10".to_string(),
        min_age: req.min_age,
        note: "DOB resolved via {{profile.date_of_birth}} inside enclave only".to_string(),
    };

    serde_json::to_vec(&output).map_err(|e| e.to_string())
}

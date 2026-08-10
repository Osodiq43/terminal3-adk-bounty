#![cfg_attr(not(target_arch = "wasm32"), allow(dead_code))]

extern crate alloc;

pub const CONTRACT_VERSION: &str = "0.1.0";

wit_bindgen::generate!({
    world: "credential-oracle",
    path: "wit",
    additional_derives: [
        serde::Deserialize,
        serde::Serialize,
    ],
    generate_all,
});

mod verify_age;
mod verify_income;

struct Component;

#[cfg(target_arch = "wasm32")]
impl exports::z::credential_oracle::contracts::Guest for Component {
    fn verify_age(
        req: exports::z::credential_oracle::contracts::GenericInput,
    ) -> Result<alloc::vec::Vec<u8>, alloc::string::String> {
        let input = req.input.ok_or("verify-age: missing input")?;
        verify_age::run(&input)
    }

    fn verify_income(
        req: exports::z::credential_oracle::contracts::GenericInput,
    ) -> Result<alloc::vec::Vec<u8>, alloc::string::String> {
        let input = req.input.ok_or("verify-income: missing input")?;
        verify_income::run(&input)
    }
}

#[cfg(target_arch = "wasm32")]
export!(Component);

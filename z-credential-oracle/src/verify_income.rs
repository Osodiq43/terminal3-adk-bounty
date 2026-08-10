use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Input {
    threshold: u64,
}

#[derive(Serialize)]
struct Output {
    approved: bool,
    tier: String,
    meets_threshold: bool,
    message: String,
}

pub fn run(input: &[u8]) -> Result<alloc::vec::Vec<u8>, alloc::string::String> {
    let req: Input = serde_json::from_slice(input)
        .map_err(|e| format!("verify-income: bad input: {}", e))?;

    let tid_bytes = crate::host::tenant::tenant_context::tenant_did();
    let tid: alloc::string::String = tid_bytes
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect();
    let map_name = format!("z:{}:userdata", tid);

    let income_bytes = crate::host::interfaces::kv_store::get(&map_name, b"annual_income")
        .map_err(|e| format!("kv read error: {}", e))?
        .ok_or("annual_income not found")?;

    let income: u64 = alloc::string::String::from_utf8(income_bytes)
        .map_err(|e| e.to_string())?
        .trim()
        .parse()
        .map_err(|e| format!("invalid income value: {}", e))?;

    let (tier, approved) = if income >= req.threshold * 2 {
        ("A", true)
    } else if income >= req.threshold {
        ("B", true)
    } else if income >= req.threshold * 7 / 10 {
        ("C", true)
    } else {
        ("D", false)
    };

    let output = Output {
        approved,
        tier: tier.to_string(),
        meets_threshold: income >= req.threshold,
        message: if approved {
            "Income verification passed".to_string()
        } else {
            "Income below required threshold".to_string()
        },
    };

    serde_json::to_vec(&output).map_err(|e| e.to_string())
}

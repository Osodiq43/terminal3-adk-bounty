import {
  T3nClient, loadWasmComponent, createEthAuthInput,
  eth_get_address, metamask_sign, LogLevel, setGlobalLogLevel,
  tenantDidHex,
} from "@terminal3/t3n-sdk";
import { readFileSync } from "fs";

setGlobalLogLevel(LogLevel.ERROR);
const NODE_URL = "https://cn-api.sg.testnet.t3n.terminal3.io";
const key = process.env.T3N_API_KEY!;
const address = eth_get_address(key);
const t3n = new T3nClient({
  baseUrl: NODE_URL,
  wasmComponent: await loadWasmComponent(),
  trustAnchor: { unsafe_trust_server: true },
  handlers: { EthSign: metamask_sign(address, undefined, key) },
});
await t3n.handshake();
const didObj = await t3n.authenticate(createEthAuthInput(address));
const tenantDid = didObj.toString();
const tid = tenantDidHex(tenantDid);
console.log("DID:", tenantDid);

// Step 1: Create userdata map
console.log("\nStep 1: Creating userdata map...");
try {
  const result = await (t3n as any).execute({
    script_name: "tee:tenant/contracts",
    script_version: "1.25.0",
    function_name: "map-create",
    input: {
      map_name: `z:${tid}:userdata`,
      visibility: "private",
      writers: { only: [] },
      readers: { only: [] },
    }
  });
  console.log("Userdata map created:", JSON.stringify(result));
} catch (e: any) {
  console.log("Map create error (may already exist):", e.message?.slice(0, 150));
}

// Step 2: Seed income into userdata map
console.log("\nStep 2: Seeding annual_income...");
try {
  const result = await (t3n as any).execute({
    script_name: "tee:tenant/contracts",
    script_version: "1.25.0",
    function_name: "map-entry-set",
    input: {
      map_name: `z:${tid}:userdata`,
      key: "annual_income",
      value: "75000",
    }
  });
  console.log("Income seeded:", JSON.stringify(result));
} catch (e: any) {
  console.log("Seed error:", e.message?.slice(0, 150));
}

// Step 3: Register the oracle contract
console.log("\nStep 3: Registering z-credential-oracle...");
const wasm = readFileSync("../z-credential-oracle/target/wasm32-wasip2/release/z_credential_oracle.wasm");
console.log("WASM size:", wasm.length, "bytes");
try {
  const result = await (t3n as any).executeWithBlob(
    {
      script_name: "tee:tenant/contracts",
      script_version: "1.25.0",
      function_name: "contract-register",
      input: {
        name: `z:${tid}:credential-oracle`,
        version: "0.1.1",
      }
    },
    wasm
  );
  console.log("Contract registered:", JSON.stringify(result));
} catch (e: any) {
  console.log("Register error:", e.message?.slice(0, 150));
}

// Step 4: Invoke verify-income
console.log("\nStep 4: Invoking verify-income (threshold: 50000)...");
try {
  const result = await (t3n as any).execute({
    script_name: `z:${tid}:credential-oracle`,
    script_version: "0.1.1",
    function_name: "verify-income",
    input: { threshold: 50000 }
  });
  console.log("verify-income result:", JSON.stringify(result));
} catch (e: any) {
  console.log("Invoke error:", e.message?.slice(0, 300));
}

// Step 5: Invoke verify-age
console.log("\nStep 5: Invoking verify-age (min_age: 18)...");
try {
  const result = await (t3n as any).execute({
    script_name: `z:${tid}:credential-oracle`,
    script_version: "0.1.1",
    function_name: "verify-age",
    input: { min_age: 18 }
  });
  console.log("verify-age result:", JSON.stringify(result));
} catch (e: any) {
  console.log("Invoke error:", e.message?.slice(0, 300));
}

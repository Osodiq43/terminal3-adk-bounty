import {
  T3nClient, loadWasmComponent, createEthAuthInput,
  eth_get_address, metamask_sign, LogLevel, setGlobalLogLevel,
  tenantDidHex,
} from "@terminal3/t3n-sdk";

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
console.log("=== z-credential-oracle DEMO ===");
console.log("Tenant DID:", tenantDid);
console.log("Contract:   z:" + tid + ":credential-oracle");
console.log("Contract ID: 584");
console.log();

// verify-age
console.log("--- Function 1: verify-age ---");
console.log("Input:  { min_age: 18 }");
console.log("Note:   DOB resolved from {{profile.date_of_birth}} inside enclave only");
const ageResult = await (t3n as any).execute({
  script_name: `z:${tid}:credential-oracle`,
  script_version: "0.1.1",
  function_name: "verify-age",
  input: { min_age: 18 }
});
console.log("Output:", ageResult);
console.log();

// verify-income - threshold met (50k, income is 75k)
console.log("--- Function 2: verify-income (threshold: 50000) ---");
console.log("Input:  { threshold: 50000 }");
console.log("Note:   Annual income stored in private KV map, never returned raw");
const incomeResult1 = await (t3n as any).execute({
  script_name: `z:${tid}:credential-oracle`,
  script_version: "0.1.1",
  function_name: "verify-income",
  input: { threshold: 50000 }
});
console.log("Output:", incomeResult1);
console.log();

// verify-income - threshold NOT met (100k, income is 75k)
console.log("--- Function 2: verify-income (threshold: 100000) ---");
console.log("Input:  { threshold: 100000 }");
const incomeResult2 = await (t3n as any).execute({
  script_name: `z:${tid}:credential-oracle`,
  script_version: "0.1.1",
  function_name: "verify-income",
  input: { threshold: 100000 }
});
console.log("Output:", incomeResult2);
console.log();
console.log("=== Raw income never exposed. Only verdicts returned. ===");

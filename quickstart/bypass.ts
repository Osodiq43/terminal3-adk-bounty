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
console.log("DID:", tenantDid);

// Test 1 confirmed: script_name + script_version + function_name works
// But input needs map_name not tail
// Server accepted field list: map_name, visibility, writers, readers,
// key_validator, storage_tier, storage_location, tenant

console.log("\nAttempting map creation with correct field names...");
try {
  const result = await (t3n as any).execute({
    script_name: "tee:tenant/contracts",
    script_version: "1.25.0",
    function_name: "map-create",
    input: {
      map_name: `z:${tid}:secrets`,
      visibility: "private",
      writers: { only: [] },
      readers: { only: [] },
    }
  });
  console.log("Map created! Result:", JSON.stringify(result));
} catch (e: any) {
  console.log("Error:", e.message?.slice(0, 300));
}

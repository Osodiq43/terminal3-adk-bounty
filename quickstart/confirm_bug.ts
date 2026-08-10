import {
  T3nClient, loadWasmComponent, createEthAuthInput,
  eth_get_address, metamask_sign, TenantClient,
  LogLevel, setGlobalLogLevel,
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
const tenant = new TenantClient({ t3n, tenantDid, baseUrl: NODE_URL });
console.log("Connected:", tenantDid);

// Test 1: getStatus on a map (read-only, no create needed)
console.log("\nTest 1: maps.getStatus...");
try {
  const status = await tenant.maps.getStatus("secrets");
  console.log("getStatus result:", JSON.stringify(status));
} catch (e: any) {
  console.log("getStatus error:", e.message?.slice(0, 300));
}

// Test 2: entrySet directly without map creation
console.log("\nTest 2: maps.entrySet directly...");
try {
  await tenant.maps.entrySet("secrets", "test_key", "test_value");
  console.log("entrySet SUCCESS");
} catch (e: any) {
  console.log("entrySet error:", e.message?.slice(0, 300));
}

// Test 3: Try contracts.list to see if ANY control action works
console.log("\nTest 3: contracts list...");
try {
  const contracts = await (tenant as any).contracts?.list?.();
  console.log("contracts list:", JSON.stringify(contracts));
} catch (e: any) {
  console.log("contracts list error:", e.message?.slice(0, 300));
}

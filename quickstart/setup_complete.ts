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

const mapName = `z:${tid}:secrets`;

// Seed the API key into the secrets map
console.log("\nSeeding duffel_api_key into secrets map...");
try {
  const result = await (t3n as any).execute({
    script_name: "tee:tenant/contracts",
    script_version: "1.25.0",
    function_name: "map-entry-set",
    input: {
      map_name: mapName,
      key: "duffel_api_key",
      value: process.env.DUFFEL_API_KEY ?? "placeholder-duffel-key",
    }
  });
  console.log("Key seeded! Result:", JSON.stringify(result));
} catch (e: any) {
  console.log("map-entry-set error:", e.message?.slice(0, 300));
}

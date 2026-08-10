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

const CONTRACT_ID = 584;
const mapName = `z:${tid}:userdata`;

// Grant contract 584 read access to userdata map
console.log("\nGranting contract read access to userdata map...");
try {
  const result = await (t3n as any).execute({
    script_name: "tee:tenant/contracts",
    script_version: "1.25.0",
    function_name: "map-update",
    input: {
      map_name: mapName,
      readers: { only: [CONTRACT_ID] },
    }
  });
  console.log("Access granted:", JSON.stringify(result));
} catch (e: any) {
  console.log("Grant error:", e.message?.slice(0, 300));
}

// Now invoke verify-income
console.log("\nInvoking verify-income (threshold: 50000)...");
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

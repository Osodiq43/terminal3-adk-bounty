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
const contractName = `z:${tid}:flight-booking`;

// Use correct transport fields (script_name/script_version)
// Keep input in camelCase as SDK builds it
console.log("\nStep 1: Self-grant via direct execute...");
try {
  const result = await (t3n as any).execute({
    script_name: "tee:tenant/contracts",
    script_version: "1.25.0",
    function_name: "agent-auth-update",
    input: {
      grants: [{
        agentDid: tenantDid,
        piiDid: tenantDid,
        contractName: contractName,
        contractVersion: "0.4.1",
        functions: ["search-offers"],
        allowedHosts: ["api.duffel.com"],
      }],
      discover_dids: [tenantDid],
    }
  });
  console.log("Grant SUCCESS:", JSON.stringify(result));
} catch (e: any) {
  console.log("Grant error:", e.message?.slice(0, 300));
}

// Step 2: Invoke
console.log("\nStep 2: Invoking search-offers...");
try {
  const result = await (t3n as any).execute({
    script_name: contractName,
    script_version: "0.4.1",
    function_name: "search-offers",
    input: {
      origin: "LHR",
      destination: "JFK",
      departure_date: "2026-09-01",
      cabin_class: "economy",
      adult_count: 1,
    }
  });
  console.log("Invoke SUCCESS:", JSON.stringify(result)?.slice(0, 1000));
} catch (e: any) {
  console.log("Invoke error:", e.message?.slice(0, 300));
}

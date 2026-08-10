import {
  T3nClient, loadWasmComponent, createEthAuthInput,
  eth_get_address, metamask_sign, TenantClient,
  LogLevel, setGlobalLogLevel, tenantDidHex,
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
const contractName = `z:${tid}:flight-booking`;
const tenant = new TenantClient({ t3n, tenantDid, baseUrl: NODE_URL });

// Check what AGENT_AUTH_CONTRACT constant resolves to
// and what the full payload looks like for agentAuthUpdate
// Use controlPayload to inspect - try different function names
for (const fn of ["agent-auth-update", "agentAuthUpdate", "agent_auth_update"]) {
  try {
    const payload = await tenant.controlPayload(fn, {
      grants: [{
        agentDid: tenantDid,
        piiDid: tenantDid,
        contractName,
        contractVersion: "0.4.1",
        functions: ["search-offers"],
        allowedHosts: ["api.duffel.com"],
      }],
      discover_dids: [tenantDid],
    });
    console.log(`\nPayload for "${fn}":`);
    console.log(JSON.stringify(payload, null, 2));
  } catch (e: any) {
    console.log(`"${fn}" payload error:`, e.message?.slice(0, 100));
  }
}

// Also check what AGENT_AUTH_CONTRACT is by looking at exports
const sdk = await import("@terminal3/t3n-sdk");
const agentAuthKeys = Object.keys(sdk).filter(k => 
  k.toLowerCase().includes("agent") || k.toLowerCase().includes("auth")
);
console.log("\nAgent/auth related exports:", agentAuthKeys);

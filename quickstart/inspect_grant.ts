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

// agentAuthUpdate is on T3nClient directly, not TenantClient
// Check if it has a different internal path
console.log("agentAuthUpdate source preview:");
console.log((t3n as any).agentAuthUpdate.toString().slice(0, 400));
console.log();

// Also check executeUserContract  
console.log("executeUserContract source preview:");
console.log((t3n as any).executeUserContract.toString().slice(0, 400));

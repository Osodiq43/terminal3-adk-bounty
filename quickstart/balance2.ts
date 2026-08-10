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
console.log("DID:", tenantDid);

const tenant = new TenantClient({ t3n, tenantDid, baseUrl: NODE_URL });

// Try tenant.token namespace
console.log("tenant.token methods:", Object.getOwnPropertyNames(
  Object.getPrototypeOf(tenant.token)
));

try {
  const usage = await tenant.token.getUsage({ limit: 5 });
  console.log("token.getUsage:", JSON.stringify(usage, null, 2));
} catch (e: any) {
  console.log("token.getUsage error:", e.message?.slice(0, 200));
}

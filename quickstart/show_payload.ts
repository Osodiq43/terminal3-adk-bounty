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

const payload = await tenant.controlPayload("map-create", {
  tail: "secrets",
  visibility: "private",
  writers: { only: [] },
  readers: { only: [] },
});
console.log("Exact payload SDK sends to server:");
console.log(JSON.stringify(payload, null, 2));

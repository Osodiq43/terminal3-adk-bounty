import {
  T3nClient, loadWasmComponent,
  createEthAuthInput, eth_get_address, metamask_sign,
  LogLevel, setGlobalLogLevel,
} from "@terminal3/t3n-sdk";

setGlobalLogLevel(LogLevel.ERROR);

const NODE_URL = "https://cn-api.sg.testnet.t3n.terminal3.io";
const key = process.env.T3N_API_KEY!;
const address = eth_get_address(key);

const client = new T3nClient({
  baseUrl: NODE_URL,
  wasmComponent: await loadWasmComponent(),
  trustAnchor: { unsafe_trust_server: true },
  handlers: { EthSign: metamask_sign(address, undefined, key) },
});

await client.handshake();
const did = await client.authenticate(createEthAuthInput(address));
console.log("DID:", did.toString());

try {
  const usage = await (client as any).getUsage();
  console.log("Usage:", JSON.stringify(usage, null, 2));
} catch (e: any) {
  console.log("getUsage error:", e.message);
}

try {
  const me = await (client as any).tenantMe?.();
  console.log("Me:", JSON.stringify(me, null, 2));
} catch (e: any) {
  console.log("tenantMe error:", e.message);
}

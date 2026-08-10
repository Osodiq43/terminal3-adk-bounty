import {
  T3nClient, loadWasmComponent, createEthAuthInput,
  eth_get_address, metamask_sign, LogLevel, setGlobalLogLevel,
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

// Try every balance-related method with no args
for (const method of ['getBalance', 'getUsage', 'getStatus', 'getDid', 'getSessionId']) {
  try {
    const result = await (client as any)[method]();
    console.log(`${method}:`, JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.log(`${method} error:`, e.message?.slice(0, 150));
  }
}

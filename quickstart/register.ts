import {
  T3nClient, loadWasmComponent, createEthAuthInput,
  eth_get_address, metamask_sign, LogLevel, setGlobalLogLevel,
  tenantDidHex,
} from "@terminal3/t3n-sdk";
import { readFileSync } from "fs";

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

const wasm = readFileSync("../z-tenant-flight/target/wasm32-wasip2/release/z_tenant_flight.wasm");
console.log("WASM loaded:", wasm.length, "bytes");

// sendMultipartRpcRequest only supports action.execute
// executeWithBlob expects a canonical z:<tid>: name
// Try executeWithBlob with the full canonical contract name
console.log("\nAttempt: executeWithBlob with canonical name...");
try {
  const result = await (t3n as any).executeWithBlob(
    {
      script_name: "tee:tenant/contracts",
      script_version: "1.25.0",
      function_name: "contract-register",
      input: {
        name: `z:${tid}:flight-booking`,
        version: "0.4.1",
      }
    },
    wasm
  );
  console.log("SUCCESS:", JSON.stringify(result));
} catch (e: any) {
  console.log("Error:", e.message?.slice(0, 300));
}

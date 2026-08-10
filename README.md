# Terminal3 ADK Bounty Submission

## What this repo contains

### quickstart/
TypeScript files for the full ADK walkthrough. Key files:
- `quickstart.ts` — connects to T3N testnet and prints Tenant DID
- `setup_complete.ts` — creates KV map and seeds API key (working workaround)
- `register.ts` — registers the z-tenant-flight contract on testnet
- `invoke.ts` — invokes the contract inside the TEE
- `bypass.ts` — discovered the correct RPC payload format by testing against the server
- `show_payload.ts` — revealed the SDK field name mismatch (root cause of Bug #6)
- `oracle_deploy.ts` — deploys the z-credential-oracle contract
- `demo.ts` — live demo of both credential oracle functions

### z-credential-oracle/
Original Rust contract built and deployed on T3N testnet. Contract ID: 584.
Two functions: `verify-age` and `verify-income`.
Both return only a verdict. Raw personal data never leaves the enclave.

### z-tenant-flight/
Reference flight booking contract from https://github.com/Terminal-3/z-tenant-flight

## Running the code

```bash
cd quickstart
npm install
export T3N_API_KEY=your_api_key_here
npx tsx quickstart.ts
```

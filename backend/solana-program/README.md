# Escrowly Solana Program (Anchor)

This workspace contains the non-custodial Solana escrow program scaffold.

## Program

`programs/escrowly_program/src/lib.rs` includes:
- `initialize_deal` (buyer funds escrow PDA vault)
- `request_cancellation` (seller requests cancellation)
- `release_payment` (buyer releases escrow to seller)
- `approve_refund` (buyer approves refund)

## Local setup

1. Install Solana + Anchor CLI
2. Generate or configure wallet:
   - `solana config set --keypair ~/.config/solana/id.json`
3. From this folder:
   - `npm install`
   - `anchor build`
   - `anchor test`

## Devnet deploy

- `anchor deploy --provider.cluster devnet`

After deploy:
- copy program ID into frontend env (`VITE_SOLANA_ESCROW_PROGRAM`)
- update backend to validate program instructions for create/release/cancel/refund flows.

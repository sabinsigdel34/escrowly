import { AnchorProvider, BN, Program, web3 } from "@coral-xyz/anchor";

const { PublicKey, SystemProgram } = web3;

export const escrowIdl = {
  version: "0.1.0",
  name: "escrowly_program",
  instructions: [
    {
      name: "initializeDeal",
      accounts: [
        { name: "buyer", isMut: true, isSigner: true },
        { name: "seller", isMut: false, isSigner: false },
        { name: "escrowDeal", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "amountLamports", type: "u64" },
        { name: "description", type: "string" },
      ],
    },
    {
      name: "requestCancellation",
      accounts: [
        { name: "seller", isMut: true, isSigner: true },
        { name: "escrowDeal", isMut: true, isSigner: false },
      ],
      args: [],
    },
    {
      name: "releasePayment",
      accounts: [
        { name: "buyer", isMut: true, isSigner: true },
        { name: "seller", isMut: true, isSigner: false },
        { name: "escrowDeal", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "approveRefund",
      accounts: [
        { name: "buyer", isMut: true, isSigner: true },
        { name: "escrowDeal", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
};

function getProvider(connection) {
  if (!window.solana) throw new Error("Phantom wallet is required.");
  return new AnchorProvider(connection, window.solana, { commitment: "confirmed" });
}

function getProgram(connection, programId) {
  const provider = getProvider(connection);
  return new Program(escrowIdl, new PublicKey(programId), provider);
}

export function findDealPda(programId, buyer, seller) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("deal"), new PublicKey(buyer).toBuffer(), new PublicKey(seller).toBuffer()],
    new PublicKey(programId),
  )[0];
}

export async function initializeDealTx({ connection, programId, buyer, seller, amountLamports, description }) {
  const program = getProgram(connection, programId);
  const escrowDeal = findDealPda(programId, buyer, seller);

  const signature = await program.methods
    .initializeDeal(new BN(amountLamports), description)
    .accounts({
      buyer: new PublicKey(buyer),
      seller: new PublicKey(seller),
      escrowDeal,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature, escrowDeal: escrowDeal.toBase58() };
}

export async function requestCancellationTx({ connection, programId, seller, buyer }) {
  const program = getProgram(connection, programId);
  const escrowDeal = findDealPda(programId, buyer, seller);

  const signature = await program.methods
    .requestCancellation()
    .accounts({
      seller: new PublicKey(seller),
      escrowDeal,
    })
    .rpc();

  return { signature, escrowDeal: escrowDeal.toBase58() };
}

export async function releasePaymentTx({ connection, programId, buyer, seller }) {
  const program = getProgram(connection, programId);
  const escrowDeal = findDealPda(programId, buyer, seller);

  const signature = await program.methods
    .releasePayment()
    .accounts({
      buyer: new PublicKey(buyer),
      seller: new PublicKey(seller),
      escrowDeal,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature, escrowDeal: escrowDeal.toBase58() };
}

export async function approveRefundTx({ connection, programId, buyer, seller }) {
  const program = getProgram(connection, programId);
  const escrowDeal = findDealPda(programId, buyer, seller);

  const signature = await program.methods
    .approveRefund()
    .accounts({
      buyer: new PublicKey(buyer),
      escrowDeal,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature, escrowDeal: escrowDeal.toBase58() };
}

import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";

describe("escrowly_program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("workspace boots", async () => {
    assert.ok(provider.wallet.publicKey.toBase58().length > 0);
  });
});

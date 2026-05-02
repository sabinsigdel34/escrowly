import React from "react";

export function ContractTerminal() {
  return (
    <div className="es-contract-terminal" data-reveal>
      <div className="es-terminal-header">
        <div className="es-terminal-dot" />
        <div className="es-terminal-dot" />
        <div className="es-terminal-dot" />
        <div className="es-terminal-title">SimpleEscrow.sol</div>
      </div>
      <div className="es-terminal-body">
        <div>
          <span className="t-comment">// SPDX-License-Identifier: MIT</span>
        </div>
        <div>
          <span className="t-keyword">pragma</span> <span className="t-type">solidity</span> ^0.8.19;
        </div>
        <div>&nbsp;</div>
        <div>
          <span className="t-keyword">contract</span> <span className="t-type">SimpleEscrow</span> {"{"}
        </div>
        <div>&nbsp;&nbsp;<span className="t-type">struct</span> <span className="t-var">Deal</span> {"{"}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="t-type">address</span> buyer;</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="t-type">address</span> seller;</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="t-type">uint256</span> amount;</div>
        <div>&nbsp;&nbsp;{"}"}</div>
        <div>&nbsp;</div>
        <div>
          &nbsp;&nbsp;<span className="t-keyword">event</span> <span className="t-method">DealCreated</span>(<span className="t-type">uint256</span> dealId);
        </div>
        <div>
          &nbsp;&nbsp;<span className="t-keyword">event</span> <span className="t-method">FundsReleased</span>(<span className="t-type">address</span> seller);
        </div>
        <div>&nbsp;</div>
        <div>
          &nbsp;&nbsp;<span className="t-keyword">function</span> <span className="t-method">createDeal</span>() <span className="t-var">external payable</span>;
        </div>
        <div>
          &nbsp;&nbsp;<span className="t-keyword">function</span> <span className="t-method">releasePayment</span>(<span className="t-type">uint256</span> id) <span className="t-var">external</span>;
        </div>
        <div>{"}"}</div>
        <div>&nbsp;</div>
        <div>
          <span className="t-comment">// Contract ready for escrow settlement</span>
          <span className="es-typing-cursor" />
        </div>
      </div>
    </div>
  );
}


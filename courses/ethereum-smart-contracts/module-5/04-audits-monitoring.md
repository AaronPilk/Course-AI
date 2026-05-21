---
module: 5
position: 4
title: "Audits, monitoring, incident response"
objective: "Ship safely to mainnet and maintain in production."
estimated_minutes: 5
---

# Audits, monitoring, incident response

## Mainnet readiness checklist

- [ ] 100% test coverage with fuzz + invariant tests.
- [ ] Static analysis clean (Slither, Mythril).
- [ ] External audit by reputable firm.
- [ ] Multi-sig + Timelock for admin.
- [ ] Pause / emergency mechanism.
- [ ] Monitoring + alerts configured.
- [ ] Incident response runbook written.
- [ ] Bug bounty live (Immunefi).
- [ ] Documentation public + complete.
- [ ] Verified on Etherscan.

For: don't ship unprepared.

## Audit firms

- **Trail of Bits.** Premium; in-depth.
- **OpenZeppelin.** Their own library + others.
- **ConsenSys Diligence.** Mature.
- **Halborn.** Multi-chain.
- **Spearbit / Cantina.** Solo + team audits.
- **Code4rena.** Competitive (best-effort, broad coverage).
- **Sherlock.** Insurance-backed audits.

Cost: $25k-$300k+ depending on scope.

For: pick by budget + needs.

## Audit process

1. **Scope.** Define exact contracts + commit.
2. **Prep.** Clean tests + docs + threat model.
3. **Engagement.** Audit team reads + interactively asks.
4. **Report.** Findings ranked critical/high/medium/low/informational.
5. **Fixes.** Address all critical/high; document medium/low.
6. **Re-audit fix verification.**
7. **Publish report.**

Timeline: 1-8 weeks depending on scope.

For: plan ahead.

## Bug bounty (Immunefi)

```
Critical: $10k - $1M+
High: $5k - $100k
Medium: $1k - $10k
```

White-hat hackers find bugs; you pay reward. Cheaper than missing in audit.

For: ongoing security.

## Monitoring

```typescript
// Watch for unusual patterns
client.watchContractEvent({
  address: protocol,
  abi,
  eventName: "Withdraw",
  onLogs: async (logs) => {
    for (const log of logs) {
      if (log.args.amount > LARGE_AMOUNT) {
        await notifyTeam(`Large withdraw: ${log.args}`)
      }
    }
  }
})
```

Tools:
- **Tenderly.** Tx simulation + monitoring; alerts.
- **OpenZeppelin Defender Sentinel.** Watch contracts + automate responses.
- **Forta.** Threat detection bots.
- **Custom indexers (TheGraph / Goldsky).** Custom queries on activity.

For: catch issues fast.

## Tenderly War Room

Tenderly's incident response feature:
- Stream tx in real-time.
- Simulate emergency actions.
- Co-ordinate response team.

For: organized incident handling.

## Incident runbook

Document upfront:
1. **Detection.** What triggers escalation?
2. **Triage.** Who confirms it's real?
3. **Communication.** Disclose or stay quiet?
4. **Action.** Pause, white-hat exploit own contract to save funds, etc.
5. **Recovery.** Compensation plan; revised contracts.
6. **Postmortem.** Public writeup; lessons learned.

For: clear ops procedure.

## White-hat self-exploit

Famous pattern: when bug found in live contract, team exploits it themselves before attacker.

```
1. Confirm vulnerability with bounty hunter or internal find.
2. Pause if possible.
3. Use exploit yourself to extract funds to safe address.
4. Reverse + return after fix.
```

Examples: Compound (2019), Tornado Cash (2023 governance).

For: defensive playbook.

## Pause + freeze

```solidity
contract Pausable {
    bool public paused;
    
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }
}
```

Production protocols nearly always have this.

For: kill switch.

## Compensation plans

After exploit:
- Insurance treasury (e.g., 10% of fees → emergency fund).
- Tokenize debt to victims (Nexus Mutual model).
- Direct reimbursement.
- Bug bounty payments.

For: maintaining trust through recovery.

## Insurance

Optional protocol-level insurance:
- **Nexus Mutual.** Coverage on specific protocols.
- **Sherlock.** Bundled audit + cover.
- **InsurAce.** Multi-chain.
- **Self-insurance.** Treasury fund.

For: capital protection.

## Time-bomb upgrades

```solidity
contract Beta {
    uint256 public sunsetTime;
    constructor() { sunsetTime = block.timestamp + 90 days; }

    modifier active() {
        require(block.timestamp < sunsetTime, "Sunset reached");
        _;
    }
}
```

Early-version contracts auto-disable; users move to V2.

For: progressive rollout.

## DEX listing prep

Before pool listing:
- Initial liquidity calculation (low slippage at expected volumes).
- Lock liquidity (Unicrypt, Sablier) to signal commitment.
- Renounce admin keys if appropriate.
- Document tokenomics publicly.

For: DEX-ready launch.

## Communication during incidents

Best practices:
- **Twitter / Discord.** Real-time updates every 30-60 min during crisis.
- **Blog post.** Detailed within 48-72 hours.
- **Postmortem.** 1-2 weeks; root cause + fix + future prevention.

Silence kills trust faster than the exploit itself.

For: trust through transparency.

## Public verification

After deploy:
```bash
# Etherscan
npx hardhat verify --network mainnet <ADDRESS> "constructorArg1" "constructorArg2"

# Or Foundry
forge verify-contract <ADDRESS> Counter --chain mainnet --etherscan-api-key $KEY
```

Source visible; reduces "scam coin" perception.

For: ecosystem trust.

## DeFiLlama listing

Submit protocol to DeFiLlama for TVL tracking:
- Adapter (TypeScript file describing how to query TVL).
- Pull request to GitHub.

Listed protocols get visibility + credibility.

For: discoverability.

## Long-term maintenance

- Regular security reviews (annual).
- Dependency updates (OZ versions).
- Monitor evolving attack patterns.
- Community governance for major changes.

For: protocol longevity.

## Mistakes to avoid

- **No audit before mainnet.** Lost millions in unaudited launches.
- **No multi-sig.** Single-key rugs common.
- **No monitoring.** Find out about hack from Twitter.
- **Slow / no communication.** Reputation damage exceeds financial loss.

## Summary

- Audit + multi-sig + Timelock + Pausable + monitoring = mainnet table stakes.
- Bug bounty (Immunefi) ongoing security.
- Tenderly / Defender / Forta for monitoring + response.
- Transparent communication during incidents preserves trust.
- Public verification + DeFiLlama listing for ecosystem credibility.

That's the course. Next steps: build, test, audit, ship — in that order.

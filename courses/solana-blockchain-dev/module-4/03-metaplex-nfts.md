---
module: 4
position: 3
title: "Metaplex and NFT standards"
objective: "Create, mint, and manage NFTs using Metaplex."
estimated_minutes: 5
---

# Metaplex and NFT standards

## NFT = SPL Token with 0 decimals + supply 1

Technically an NFT on Solana is a regular SPL token mint where:
- Decimals = 0.
- Supply = 1.
- Mint authority renounced after first mint.
- Metadata account attached (Metaplex).

For: understanding the substrate.

## Metaplex Token Metadata

Metaplex Token Metadata is the canonical metadata standard. Each NFT has:
- **Mint account.** The SPL token.
- **Metadata account.** Name, symbol, URI, creators, royalties.
- **Master Edition account.** Limits supply to 1; tracks editions.
- **Token account.** Owner's account holding the 1 NFT.

For: NFT data model.

## Metadata structure

```rust
pub struct Metadata {
    pub key: Key,
    pub update_authority: Pubkey,
    pub mint: Pubkey,
    pub data: Data,
    pub primary_sale_happened: bool,
    pub is_mutable: bool,
    pub edition_nonce: Option<u8>,
    pub token_standard: Option<TokenStandard>,
    pub collection: Option<Collection>,
    pub uses: Option<Uses>,
    pub collection_details: Option<CollectionDetails>,
    pub programmable_config: Option<ProgrammableConfig>,
}

pub struct Data {
    pub name: String,           // Max 32 chars
    pub symbol: String,         // Max 10 chars
    pub uri: String,            // URL to JSON file
    pub seller_fee_basis_points: u16,    // Royalty (bps)
    pub creators: Option<Vec<Creator>>,
}
```

For: NFT metadata fields.

## Off-chain JSON

The `uri` points to JSON file (Arweave / IPFS / NFT.Storage):

```json
{
  "name": "My NFT #1",
  "symbol": "MNF",
  "description": "Description here",
  "image": "https://arweave.net/<hash>",
  "external_url": "https://mysite.com",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Eyes", "value": "Laser" }
  ],
  "properties": {
    "files": [
      { "uri": "https://arweave.net/<hash>", "type": "image/png" }
    ],
    "category": "image"
  }
}
```

For: rich metadata + traits.

## mpl-token-metadata in code

```rust
use mpl_token_metadata::accounts::Metadata;
use mpl_token_metadata::instructions::CreateMetadataAccountV3CpiBuilder;

CreateMetadataAccountV3CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .metadata(&ctx.accounts.metadata)
    .mint(&ctx.accounts.mint)
    .mint_authority(&ctx.accounts.mint_authority)
    .payer(&ctx.accounts.payer)
    .update_authority(&ctx.accounts.update_authority, true)
    .system_program(&ctx.accounts.system_program)
    .data(DataV2 {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
        seller_fee_basis_points: 500,    // 5% royalty
        creators: Some(vec![Creator {
            address: ctx.accounts.creator.key(),
            verified: true,
            share: 100
        }]),
        collection: None,
        uses: None,
    })
    .is_mutable(true)
    .invoke()?;
```

For: creating metadata via CPI.

## Master Edition

```rust
use mpl_token_metadata::instructions::CreateMasterEditionV3CpiBuilder;

CreateMasterEditionV3CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .edition(&ctx.accounts.master_edition)
    .mint(&ctx.accounts.mint)
    .update_authority(&ctx.accounts.update_authority)
    .mint_authority(&ctx.accounts.mint_authority)
    .metadata(&ctx.accounts.metadata)
    .payer(&ctx.accounts.payer)
    .system_program(&ctx.accounts.system_program)
    .token_program(&ctx.accounts.token_program)
    .max_supply(0)    // 0 = 1-of-1
    .invoke()?;
```

`max_supply` of 0 = unique 1-of-1. Higher number = limited edition with prints.

For: NFT uniqueness guarantee.

## NFT collections

Collection NFT = parent NFT representing the set. Items reference it:

```rust
let collection = Some(Collection {
    verified: false,  // Verified later via separate ix
    key: collection_nft_mint
});
```

After mint, collection authority verifies membership:

```rust
VerifyCollectionCpiBuilder::new(&token_metadata_program)
    .metadata(&item_metadata)
    .collection_authority(&collection_authority)
    // ...
    .invoke()?;
```

For: organized NFT collections.

## Royalties

`seller_fee_basis_points` = 500 → 5% royalty.

Solana royalties are now enforced on-chain via:
- **Programmable NFTs (pNFTs).** Token Metadata enforces royalty at transfer.
- **Marketplaces voluntarily.** Magic Eden / Tensor honor royalties.

For: creator revenue.

## Updating metadata

```rust
UpdateMetadataAccountV2CpiBuilder::new(&token_metadata_program)
    .metadata(&metadata)
    .update_authority(&update_authority)
    .new_data(new_data)
    .invoke()?;
```

If `is_mutable = true`, can update. After freeze, immutable.

For: dynamic NFTs / fixing errors.

## Candy Machine (mint at scale)

Metaplex Candy Machine = batch NFT mint system:
- Pre-load config (price, supply, asset URIs).
- Set guards (allowlist, payment, mint limits).
- Users call mint instruction.
- Random asset assigned.

Standard for 10k PFP launches.

For: large-scale launches.

## Mintlist (allowlist guards)

```rust
// Candy Machine guards
allowList: { merkleRoot: ... }
solPayment: { lamports: 0.5_SOL, destination: ... }
mintLimit: { id: 1, limit: 3 }
startDate: { date: ... }
```

Composable mint conditions.

For: launch fairness + economics.

## Compressed NFTs (cNFTs)

Bubblegum program uses Merkle trees for cheap NFTs:
- ~$0.0001 per mint vs. ~$0.01 for regular.
- 1M+ NFTs feasible.
- Tradeoff: traditional wallets / marketplaces need cNFT support.

For: massive-scale collections.

## Programmable NFTs (pNFTs)

```rust
TokenStandard::ProgrammableNonFungible
```

Adds:
- Royalty enforcement on transfer.
- Authorization rules (custom transfer logic).
- Per-token freeze controls.

For: enforced royalties + access control.

## Reading NFT data

```typescript
import { Metadata, deserializeMetadata } from "@metaplex-foundation/mpl-token-metadata"

const metadataAddress = PublicKey.findProgramAddressSync(
  [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), nftMint.toBuffer()],
  TOKEN_METADATA_PROGRAM_ID
)[0]

const account = await connection.getAccountInfo(metadataAddress)
const metadata = deserializeMetadata(account.data)
console.log(metadata.data.name, metadata.data.uri)
```

For: client-side NFT data.

## Mistakes to avoid

- **Storing image bytes on-chain.** Use Arweave / IPFS for assets.
- **Forgetting to freeze metadata.** Anyone with update authority can change name/image.
- **No collection.** Hard to verify legitimacy.
- **Ignoring cNFTs for large drops.** 10k regular NFT mint costs $100+.

## Summary

- NFT = SPL token (0 decimals, supply 1) + Metaplex Metadata.
- Master Edition = uniqueness; Collection = grouping.
- Candy Machine for mass mints; cNFTs for ultra-cheap scale.
- Programmable NFTs enforce royalties.

Next: building a token-gated app.

---
module: 3
position: 2
title: "ERC-721 NFTs"
objective: "Build non-fungible tokens with metadata + royalties."
estimated_minutes: 5
---

# ERC-721 NFTs

## What ERC-721 defines

```solidity
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}
```

Each `tokenId` is unique; ownership tracked by token ID.

For: NFT interface standard.

## OpenZeppelin ERC721

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("MyNFT", "MNFT") {}

    function mint(address to, string memory uri) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}
```

For: basic NFT.

## Token URI + metadata

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory) {
    return string(abi.encodePacked(baseURI(), Strings.toString(tokenId)));
}
```

URI points to off-chain JSON:
```json
{
  "name": "My NFT #1",
  "description": "A cool NFT",
  "image": "ipfs://Qm...",
  "attributes": [
    { "trait_type": "Color", "value": "Blue" }
  ]
}
```

OpenSea / wallets read this.

For: NFT presentation.

## On-chain metadata

```solidity
function tokenURI(uint256 tokenId) public pure returns (string memory) {
    string memory svg = generateSVG(tokenId);
    string memory json = string(abi.encodePacked(
        '{"name":"#', Strings.toString(tokenId),
        '","image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
        '"}'
    ));
    return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
}
```

Fully on-chain NFT. Examples: Loot, Nouns, Chainfaces.

For: censorship-resistant NFTs.

## ERC-721 enumerable

```solidity
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MyNFT is ERC721Enumerable {
    // Adds: tokenOfOwnerByIndex, tokenByIndex, totalSupply
}
```

Lets you iterate tokens; gas-expensive. Avoid for high-volume mints.

For: small / curated collections.

## ERC-721A (optimized)

Azuki's optimized implementation. Mints 5 NFTs in one tx for 1.5× gas instead of 5×.

```solidity
import "erc721a/contracts/ERC721A.sol";

contract MyNFT is ERC721A {
    constructor() ERC721A("MyNFT", "MNFT") {}

    function mint(uint256 quantity) external payable {
        _mint(msg.sender, quantity);
    }
}
```

For: large-scale mints.

## Royalties (ERC-2981)

```solidity
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract MyNFT is ERC721, ERC2981 {
    constructor() ERC721("X", "X") {
        _setDefaultRoyalty(creator, 500);    // 5% royalty
    }
}
```

Marketplaces (OpenSea, Blur, LooksRare) query this; honor royalty payment.

Note: Royalty enforcement is voluntary; some marketplaces removed enforcement.

For: creator revenue.

## Burnable

```solidity
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
```

Lets holders destroy tokens. Useful for redemption mechanics.

For: NFT utility.

## Allowlist mint

```solidity
contract NFTMint is ERC721, Ownable {
    bytes32 public merkleRoot;
    mapping(address => bool) public claimed;

    function mint(bytes32[] calldata proof) external payable {
        require(!claimed[msg.sender], "Already claimed");
        require(MerkleProof.verify(proof, merkleRoot, keccak256(abi.encodePacked(msg.sender))), "Not on list");
        claimed[msg.sender] = true;
        _safeMint(msg.sender, ++_nextId);
    }
}
```

Merkle root = compact allowlist; users provide proof.

For: gated drops.

## Reveal pattern

```solidity
string private _baseTokenURI = "ipfs://placeholder/";   // Pre-reveal
string private _revealedBaseTokenURI = "ipfs://Qm.../"; // Post-reveal
bool private _revealed = false;

function reveal() external onlyOwner {
    _baseTokenURI = _revealedBaseTokenURI;
    _revealed = true;
}
```

Hide artwork until mint complete; prevents rarity sniping.

For: drop UX.

## Provenance hash

```solidity
bytes32 public constant PROVENANCE_HASH = 0x...;  // Set at deploy

// Off-chain: hash of all final artworks in declared order
// Reveals tampering if final assets don't match
```

For: trust signaling.

## NFT staking

```solidity
mapping(uint256 => address) public originalOwner;
mapping(uint256 => uint256) public stakedAt;

function stake(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender);
    transferFrom(msg.sender, address(this), tokenId);
    originalOwner[tokenId] = msg.sender;
    stakedAt[tokenId] = block.timestamp;
}
```

NFT held by contract; rewards accumulate over time.

For: NFT utility programs.

## Soulbound (non-transferable)

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal pure override {
    require(from == address(0) || to == address(0), "Soulbound: non-transferable");
    // Allow mint (from = 0) and burn (to = 0) only
}
```

For: achievements, credentials, identity.

## Mistakes to avoid

- **Storing metadata on centralized server.** Goes offline = NFT dead. Use IPFS / Arweave.
- **Forgetting tokenURI override.** Wallets show blank.
- **Mint to msg.sender in payable.** Use to parameter; prevents accidental burn.
- **Royalties hardcoded.** Marketplace policy varies; document expectations.

## Summary

- ERC-721 = unique tokens with owner per ID.
- OpenZeppelin standard; ERC-721A for cheap mass mints.
- Metadata via tokenURI → JSON (IPFS / Arweave / on-chain).
- Royalties via ERC-2981 (voluntary enforcement).
- Allowlist via merkle proof; reveal pattern.

Next: ERC-1155 multi-token.

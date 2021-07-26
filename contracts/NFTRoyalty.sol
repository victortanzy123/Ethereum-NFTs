// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// ERC721 Token standard contract & IERC20
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTRoyalty is ERC721 {
    /// Variables:
    address public artist;
    address public txToken;
    uint256 public txTaxAmount;

    /// Mappings:
    mapping(address => bool) public royaltyWaiveList;

    /// Modifiers:
    modifier onlyOwner() {
        require(msg.sender == artist, "only artist");
        _;
    }

    constructor(
        address _artist,
        address _txToken,
        uint256 _txTaxAmount,
        string memory _nftName,
        string memory _nftSymbol
    ) ERC721(_nftName, _nftSymbol) {
        artist = _artist;
        txToken = _txToken;
        txTaxAmount = _txTaxAmount;

        // Update default privileges of artist:
        royaltyWaiveList[_artist] = true;
        _mint(artist, 0);
    }

    /// Function to update waival of royalities:
    function setWaiveRoyalty(address _toBeExcluded, bool _status)
        external
        onlyOwner
    {
        royaltyWaiveList[_toBeExcluded] = _status;
    }

    // tokenId : number of copies, in this case only 1 => index = 0;
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        // From ERC721 Contract:
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        // Include Payment of royalties:
        if (!royaltyWaiveList[from]) {
            payRoyaltyFee(from);
        }

        _transfer(from, to, tokenId);
    }

    /// SafeTransferFrom - check if recipient address is able to handle ERC721 token to avoid log tokens

    /// Variation without passing in data:
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /// Real executed safeTransferFrom function:
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        // Payment of royalties:
        if (!royaltyWaiveList[from]) {
            payRoyaltyFee(from);
        }

        _safeTransfer(from, to, tokenId, _data);
    }

    /// Function to pay royalties:
    function payRoyaltyFee(address _from) internal {
        // Instantiate ERC20 token contract:
        IERC20 token = IERC20(txToken);

        // Transfer royalty fee in terms of the specified transaction token:
        token.transferFrom(_from, artist, txTaxAmount);
    }
}

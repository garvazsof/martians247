// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Martians is ERC721, ERC721Enumerable, Pausable, AccessControl, Ownable, ERC721Burnable {

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private maxMintNumber;
    string private metadataURI;
    address private martiansWallet;
    mapping (uint256 => uint256) private prices;
    mapping (address => uint256) public buyers;

    uint private constant premintPrice = 30000000000000000;
    uint private constant regularPrice = 60000000000000000;

    constructor(string memory initMetadataURI, address initMartiansWallet) ERC721("Martians", "M247") {

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        maxMintNumber = 4;
        prices[premintPrice] = 747;
        prices[regularPrice] = 4000;

        metadataURI = initMetadataURI;
        martiansWallet = initMartiansWallet;
    }

    function _baseURI() internal view override returns (string memory) {
        return metadataURI;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(uint256 quantity) external payable {

        require(quantity > 0, "Needs to provide a valid number of martians");
        require(totalSupply() <= 4747, "Can't Mint more that 4747 Martians");
        
        uint256 previousMintedMartians = buyers[msg.sender];
        uint256 newMintedNumber = 0;

        if(previousMintedMartians > 0) {
            newMintedNumber = previousMintedMartians + quantity;
            require(newMintedNumber <= maxMintNumber, "Can't buy more martians per transaction than maxMintNumber");
        }
        else 
            newMintedNumber = quantity;

        uint256 mintingPrice = 30000000000000000;
        if(this.totalSupply() > 747)
            mintingPrice = 60000000000000000;

        uint256 amount = quantity * mintingPrice;
        require(msg.value >= amount, "Need to send the quantity * minting price");

        (bool sent, ) = martiansWallet.call{value: msg.value}("");
        require(sent, "Failed to send the payment for martians");

        _mint(msg.sender, quantity);
        buyers[msg.sender] = newMintedNumber;
    }

    function updateMetadataURI(string calldata _newUri) public onlyOwner {
        metadataURI = _newUri;
    }

    function tokenURI(uint256 id) override public view returns (string memory) {
        return string(abi.encodePacked(metadataURI, Strings.toString(id), ".json"));
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
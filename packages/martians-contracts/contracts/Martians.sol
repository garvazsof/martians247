// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

//import "@openzeppelin/contracts/interfaces/IERC721.sol";
//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Martians is ERC721A, Pausable, AccessControl, Ownable  {

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private maxMintNumber;
    string private metadataURI;
    address private martiansWallet;
    mapping (uint256 => uint256) private prices;
    mapping (address => uint256) public buyers;
    mapping(address => uint256) public freeToken;

    uint private constant premintPrice = 300000000000000; //30000000000000000;
    uint private constant regularPrice = 600000000000000; //60000000000000000;

    constructor(string memory initMetadataURI, address initMartiansWallet) ERC721A("Martians", "M247") {

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
        require(totalSupply() + quantity <= 4747, "Can't Mint more that 4747 Martians");
        uint256 newMintedNumber = quantity;
        
        if(!hasRole(MINTER_ROLE, msg.sender))
            {
            uint256 previousMintedMartians = buyers[msg.sender];

            if(previousMintedMartians > 0) {
                newMintedNumber = previousMintedMartians + quantity;
                require(newMintedNumber <= maxMintNumber, "Can't buy more martians per transaction than maxMintNumber");
            }

            uint256 mintingPrice = premintPrice;
            if(this.totalSupply() > 747)
                mintingPrice = regularPrice;

            uint256 amount = quantity * mintingPrice;
            require(msg.value >= amount, "Need to send the quantity * minting price");

            (bool sent, ) = martiansWallet.call{value: msg.value}("");
            require(sent, "Failed to send the payment for martians");
            buyers[msg.sender] = newMintedNumber;
        }

        if(hasRole(MINTER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender)){
            freeToken[msg.sender] += quantity;
        }

        _mint(msg.sender, quantity);
        
    }

    function updateMetadataURI(string calldata _newUri) public onlyOwner {
        metadataURI = _newUri;
    }

    function tokenURI(uint256 id) override (ERC721A) public view returns (string memory) {
        return string(abi.encodePacked(metadataURI, Strings.toString(id), ".json"));
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /*
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    */
}


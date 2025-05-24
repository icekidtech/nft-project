pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AstralPackLegends is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 104;
    string public baseURI;
    
    uint256[] private _unmintedTokens;
    mapping(uint256 => bool) private _isMinted;
    uint256 private _nonce = 0;

    event NFTMinted(address indexed user, uint256 tokenId);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(string memory initialBaseURI) ERC721("Astral Pack Legends", "APL") Ownable(msg.sender) {
        baseURI = initialBaseURI;
        
        // Initialize the array of unminted tokens (1 to 104)
        for (uint256 i = 1; i <= MAX_SUPPLY; i++) {
            _unmintedTokens.push(i);
        }
    }

    function mintRandomNFT() external {
        require(_unmintedTokens.length > 0, "All tokens have been minted");
        
        // Generate a pseudo-random index based on various inputs
        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    _nonce++
                )
            )
        ) % _unmintedTokens.length;
        
        // Get the token ID at the random index
        uint256 tokenId = _unmintedTokens[randomIndex];
        
        // Replace the selected token with the last token in the array and remove the last token
        _unmintedTokens[randomIndex] = _unmintedTokens[_unmintedTokens.length - 1];
        _unmintedTokens.pop();
        
        // Mark the token as minted
        _isMinted[tokenId] = true;
        
        // Mint the token to the sender
        _mint(msg.sender, tokenId);
        
        emit NFTMinted(msg.sender, tokenId);
    }
    
    function getUnmintedTokens() external view returns (uint256[] memory) {
        return _unmintedTokens;
    }
    
    function totalSupply() external view returns (uint256) {
        return MAX_SUPPLY - _unmintedTokens.length;
    }
    
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    // Add receive function to accept ETH
    receive() external payable {}

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Failed to send Ether");
        
        emit Withdrawn(owner(), balance);
    }
}
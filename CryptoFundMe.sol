// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract CryptoFundMe is ERC721URIStorage {

    uint256 COUNTER;
    address payable private deployer;

    constructor() ERC721("CryptoFundMe", "CFM"){
        deployer = payable(msg.sender);
    }

    struct Fund {
        string tokenURI;
        uint256 startDate;
        uint256 endDate;
        uint256 goal;
        uint256 currentAmount;
        uint256 totalRaised;
        uint256 id;
    }

    Fund[] public funds;

    function getFunds() public view returns (Fund[] memory) { 
        return funds;
    }

    function createFund(uint256 _endDate, uint256 _goal, string memory _tokenURI) public {
        Fund memory newFund = Fund(_tokenURI, block.timestamp, _endDate, _goal, 0, 0, COUNTER);
        funds.push(newFund);
        
        _mint(msg.sender, COUNTER);
        _setTokenURI(COUNTER, _tokenURI);
        COUNTER++;
    }

    function donate(uint256 _id) public payable {
        // require(block.timestamp < funds[_id].endDate, "This fund has ended.");
        uint256 fee = msg.value / 100;
        deployer.transfer(fee);

        funds[_id].currentAmount += msg.value - fee;
        funds[_id].totalRaised += msg.value - fee;
    }

    function withdraw(uint256 _id) public {
        address payable owner = payable(ownerOf(_id));
        require(owner == msg.sender, "Only the owner of this fund can withdraw.");

        uint256 transferAmount = funds[_id].currentAmount;
        require(transferAmount > 0, "You do not have any funds to withdraw at this moment.");

        funds[_id].currentAmount = 0;
        owner.transfer(transferAmount);
    }
}
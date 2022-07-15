pragma solidity ^0.8.11;
import "./MayoralToken.sol";
contract OGG is MayoralToken{

    constructor(uint _supply)
     MayoralToken("Mayoral","OGG",18)
    {
      Mint(msg.sender, _supply);
        emit mint(msg.sender, _supply);


}
}
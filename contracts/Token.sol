// SPDX-License-Identifier: MIT

//pragma solidity >=0.6.0 <0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    
    constructor (uint _totalSupply) public ERC20("mock QTUM", "mQTUM"){        
        _mint(msg.sender, _totalSupply);          }


    function burn(address _to, uint256 _amount) onlyOwner external  {
        _burn(_to, _amount);
    }


  function mint(address _to, uint _amount) onlyOwner external  {
      _mint(_to, _amount);
  }


}
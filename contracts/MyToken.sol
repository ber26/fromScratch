pragma solidity ^0.8.0;

interface IERC20 {

    function totalSupply() external view returns (uint);
    function balanceOf(address _owner) public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

}

contract MyToken is IERC20 {
    address private owner;
    
    mapping (address => uint) private balances;
    
    uint256 private totalSupply_;

    constructor(uint256 _totalSupply) {
        totalSupply_ = _totalSupply;
        balances[owner] = _totalSupply;
    }

    function totalSupply() external view returns (uint){
        return totalSupply_;
    }
    function balanceOf(address _owner) public view returns (uint256 balance){
        return balances[_owner];
    }

    

}
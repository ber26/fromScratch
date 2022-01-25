// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {

    function totalSupply() external view returns (uint);
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
    function approve(address _spender, uint256 _value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract MyToken is IERC20 {
    address public owner;
    
    mapping(address => uint) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    uint256 public totalSupply_;

    constructor(uint256 _totalSupply) {
        owner = msg.sender;
        totalSupply_ = _totalSupply;
        balances[owner] = totalSupply_;
    }

    function totalSupply() public view virtual override returns (uint){
        return totalSupply_;
    }
    function balanceOf(address _owner) public view virtual override returns (uint256){
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value) public virtual override returns (bool success){
        require(balances[msg.sender] >= _value, 'Insufficient Balance!');
        require(msg.sender != _to, 'You cannot transfer to same wallet!');

        balances[msg.sender] -= _value;
        balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public virtual override returns (bool success){
        require(allowance(_from,_to) >= _value, "Allowance amount is too low!");
        require(balances[_from] >= _value, "Insufficient Balance!");

        balances[_from] -= _value;
        balances[_to] += _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public virtual override returns (bool success){
        allowances[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view virtual override returns (uint256 remaining){
        return allowances[_owner][_spender];
    }

}
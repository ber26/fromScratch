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
    
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    mapping(address => mapping(uint256 => uint64)) private timelocks;

    string private name_;
    string private symbol_;
    
    uint256 public totalSupply_;
    uint256 public lockedSupply_;

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        owner = msg.sender;
        name_ = _name;
        symbol_ = _symbol;
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

        _transfer(msg.sender, _to, _value);

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public virtual override returns (bool success){
        require(allowance(_from,_to) >= _value, "Allowance amount is too low!");
        require(balances[_from] >= _value, "Insufficient Balance!");

        _transfer(_from, _to, _value);

        allowances[_from][_to] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public virtual override returns (bool success){
        require(msg.sender != _spender, "Cannot Approve Same Addresses!");
        
        allowances[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view virtual override returns (uint256 remaining){
        return allowances[_owner][_spender];
    }

    function _transfer(address _from, address _to, uint256 _value) private {
        balances[_from] -= _value;
        balances[_to] += _value;
    }

    function lockedSupply() public view returns (uint256) {
        return lockedSupply_;
    }
}
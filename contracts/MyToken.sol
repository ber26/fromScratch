pragma solidity ^0.8.0;

contract Token {
    address public owner;
    mapping (address => uint) private balances;
}
//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

contract Airline{

    address public owner;

    struct Customer{
        uint loyaltyPoints;
        uint totalFlights;
    }

    struct Flight{
        string name;
        uint price;
    }

    uint etherPerPoint = 0.5 ether;

    Flight[] public flights;
    mapping(address=>Customer) public customers;
    mapping(address=>Flight[]) public customerFlights;
    mapping(address=>uint) public customerTotalFlights;

    event FlightPurchased(address indexed customer, uint price, string flight);

    constructor(){
        owner = msg.sender;
        flights.push(Flight('Tokio', 4 ether));
        flights.push(Flight('Germany', 5 ether));
        flights.push(Flight('Madrid', 3 ether));
    }

    function buyFlight(uint flightIndex) public payable{
        Flight memory flight = flights[flightIndex];
        require(msg.value == flight.price);

        Customer storage customer = customers[msg.sender];
        customer.loyaltyPoints +=5;
        customer.totalFlights+=1;
        customerFlights[msg.sender].push(flight);
        customerTotalFlights[msg.sender] ++;

        emit FlightPurchased(msg.sender, flight.price, flight.name);
    }

    function totalFlights() public view returns (uint){
        return flights.length;
    }

    function redeemLoyaltyPoints() public {
        Customer storage customer = customers[msg.sender];
        uint etherToRefund = etherPerPoint*customer.loyaltyPoints;
        payable (msg.sender).transfer(etherToRefund);
        customer.loyaltyPoints = 0;

    }

    function getRefundableEther() public view returns (uint){
        return etherPerPoint * customers[msg.sender].loyaltyPoints;
    }

    function getAirlineBalance() public view returns(uint){
        address airlineAddress = address(this);
        return airlineAddress.balance;
    }

    modifier isOwner() {
        require(msg.sender==owner);
        _;
    }
}
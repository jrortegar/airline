import React, { Component } from "react";
import Panel from "./Panel";
import getWeb3 from "./getWeb3";
import AirlineContract from "./airline";
import { AirlineService } from "./airlineService";
import { ToastContainer } from "react-toastr";

const converter = (web3) => {
    return (value) => {
        return web3.utils.fromWei(value.toString(), 'ether');
    }
}

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: undefined,
            balance: 0,
            flights: [],
            customerFlights: [],
            refundableEther: 0
        };
    }

    async componentDidMount() {
        this.web3 = await getWeb3();
        this.toEther = converter(this.web3);
        this.airline = await AirlineContract(this.web3.currentProvider);
        this.airlineService = new AirlineService(this.airline);
        var account = (await this.web3.eth.getAccounts())[0];

        this.airline.allEvents({}, function (error, event) { console.log(event); })
            .on('data', function (event) {
                let customer = event.returnValues['customer'];
                let flight = event.returnValues['flight'];
                let price = event.returnValues['price'];
                if (customer === account) {
                    console.log(`You purchased a flight to ${flight} with a cost of ${price}`);
                } else{
                    console.log(`Last customer purchased a flight to ${flight} with a cost of ${price}`, 'Flight information');
                }
            })
            .on('error', function (error, receipt) {
                console.log(`The transaction was rejected by the network. Error: ${error} with a receipt of ${receipt}`);
            });

        window.ethereum.on('accountsChanged', async function (accounts) {
            this.setState({
                account: accounts[0].toLowerCase()
            }, () => {
                this.load();
            });
        }.bind(this));

        this.setState({
            account: account.toLowerCase()
        }, () => {
            this.load();
        });
    }

    async getBalance() {
        let weiBalance = await this.web3.eth.getBalance(this.state.account);
        this.setState({
            balance: this.toEther(weiBalance)
        });
    }

    async getFlights() {
        let flights = await this.airlineService.getFlights();
        this.setState({
            flights
        });
    }

    async getRefundableEther() {
        let refundableEther = await this.airlineService.getRefundableEther(this.state.account);
        this.setState({
            refundableEther
        })
    }

    async refundLoyaltyPoints() {
        await this.airlineService.redeemLoyaltyPoints(this.state.account);
    }

    async getCustomerFlights() {
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);
        this.setState({
            customerFlights
        });
    }

    async buyFlight(flightIndex, flight) {
        await this.airlineService.buyFlight(
            flightIndex,
            this.state.account,
            flight.price
        );
    }

    async load() {
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
        this.getRefundableEther();
    }

    render() {
        return <React.Fragment>
            <div className="jumbotron">
                <h4 className="display-4">Welcome to the Airline!</h4>
            </div>

            <div className="row">
                <div className="col-sm">
                    <Panel title="Balance">
                        <p><strong>{this.state.account}</strong></p>
                        <span><strong>Balance</strong>: {this.state.balance}</span>
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Loyalty points - refundable ether">
                        <span>{parseInt("0x" + JSON.stringify(this.state.refundableEther).substring(1, JSON.stringify(this.state.refundableEther).length - 1)) / 1e18} eth</span>
                        <button className="btn btn-sm btn-success text-white" onClick={() => this.refundLoyaltyPoints()}>Refund</button>
                    </Panel>
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <Panel title="Available flights">
                        {this.state.flights.map((flight, i) => {
                            return <div key={i}>
                                <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                                <button className="btn btn-sm btn-success text-white" onClick={() => this.buyFlight(i, flight)}>Purchase</button>
                            </div>
                        })}
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Your flights">
                        {this.state.customerFlights.map((flight, i) => {
                            return <div key={i}>
                                {flight.name} - cost: {parseInt("0x" + JSON.stringify(flight.price).substring(1, JSON.stringify(flight.price).length - 1)) / 1e18}
                            </div>
                        })}
                    </Panel>
                </div>
            </div>
            <ToastContainer ref={(input) => this.container=input}
            className="toast-top-right"/>
        </React.Fragment>
    }
}
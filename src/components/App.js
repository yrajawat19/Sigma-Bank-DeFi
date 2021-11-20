import React, { Component } from 'react'
import Web3 from 'web3'
import SigmaCoin from '../abis/SigmaCoin.json'
import BetaToken from '../abis/BetaToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'
import NEWBG from '../NEWBG.jpg'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // Load SigmaCoin
    const sigmaCoinData = SigmaCoin.networks[networkId]
    if(sigmaCoinData) {
      const sigmaCoin = new web3.eth.Contract(SigmaCoin.abi, sigmaCoinData.address)
      this.setState({ sigmaCoin })
      let sigmaCoinBalance = await sigmaCoin.methods.balanceOf(this.state.account).call()
      this.setState({ sigmaCoinBalance: sigmaCoinBalance.toString() })
    } else {
      window.alert('SigmaCoin contract not deployed to detected network.')
    }

    // Load BetaToken
    const betaTokenData = BetaToken.networks[networkId]
    if(betaTokenData) {
      const betaToken = new web3.eth.Contract(BetaToken.abi, betaTokenData.address)
      this.setState({ betaToken })
      let betaTokenBalance = await betaToken.methods.balanceOf(this.state.account).call()
      this.setState({ betaTokenBalance: betaTokenBalance.toString() })
    } else {
      window.alert('BetaToken contract not deployed to detected network.')
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.sigmaCoin.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      sigmaCoin: {},
      betaToken: {},
      tokenFarm: {},
      sigmaCoinBalance: '0',
      betaTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        sigmaCoinBalance={this.state.sigmaCoinBalance}
        betaTokenBalance={this.state.betaTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-15 ml-auto mr-auto" style={{ maxWidth: '1000px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://localhost:3001/#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
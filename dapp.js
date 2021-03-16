const network = 'rinkeby'
const ERC721ADDRESS = '0x85aF596093297e169C6be6ae1DEdfbEe60Bf91d0'
const ERC721ABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"old","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"current","type":"uint256"}],"name":"BTCETHPriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"old","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"current","type":"uint256"}],"name":"BTCETHPriceUpdated","type":"event"},{"inputs":[],"name":"getBitcoinPriceInWei","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPriceInWei","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"publicSaleStart_timestampInS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]

const ethSymbol = 'Ξ'
const btcSymbol = '₿'
let maxSupply = 10000
let totalSupply = 0
let buyPrice = 0.0001
let walletAddress = 0
let addresses = 0
let btcPrice = 30
let metamaskInstalled = false
let Erc721Instance
const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

const onLoadHandler = () => {
  const walletButton = document.querySelector('#walletButton')
  const balanceLabel = document.querySelector('#balanceLabel')
  const ethPriceLabel = document.querySelector('#ethPriceLabel')
  const btcPriceLabel = document.querySelector('#btcPriceLabel')
  const pizzasLabel = document.querySelector('#pizzasLabel')
  const buyButton = document.querySelector('#buyButton')
  const contractLabel = document.querySelector('#contractLabel')
  const txLabel = document.querySelector('#txLabel')
  balanceLabel.innerHTML = '--' + ' ' + ethSymbol
  ethPriceLabel.innerHTML = '--' + ' ' + ethSymbol
  btcPriceLabel.innerHTML = '--' + ' ' + btcSymbol
  pizzasLabel.innerHTML = '--'
  contractLabel.innerHTML = "Contract Address: <p> <a href='https://" + network + ".etherscan.io/address/" +
  ERC721ADDRESS + "' target='_blank'> " + ERC721ADDRESS + " </a>"
  txLabel.innerHTML = 'You will be charged 20% more than current price, remaining will be returned'

  const promptMetamask = () => {
    window.ethereum.enable()
      .then(async () => {
        walletButton.innerHTML = "<center>Connected</center>"
        await updateBalance()
      }).catch((err) => {
      console.log(err)
    })
  }

  const triggerPurchase = () => {
    txLabel.innerHTML = 'Waiting for confirmation'
    hide(buyButton)
    var txHash = 0
    Erc721Instance.methods.getPrice().call()
      .then((weiValue) => {
        console.log('weiValue: ', weiValue)

        const roundAmount = parseFloat(1.2 * weiValue).toFixed(0)

        console.log('roundAmount: ', roundAmount)

        Erc721Instance.methods.purchase().send({from: walletAddress, value: (roundAmount)})
          .on('transactionHash', (hash) => {
            console.log('transactionHash: ', hash)
            txHash = hash
          })
          .on('receipt', (receipt) => {
            console.log('receipt: ', receipt)

            txLabel.innerHTML = "Transaction confirmed, enjoy your 🍕! <p> " +
              "<a href='https://" + network + ".etherscan.io/tx/" +
              txHash + "' target='_blank'> Transaction link </a>"

            updateValues()
            display(buyButton)
          })
          .on('error', (err, receipt) => {
            console.log('Transaction failed: ', err, 'br/', receipt)

            txLabel.innerHTML = 'Something went wrong, try again!'
            display(buyButton)
          })
      })
      .catch((error) => {
        console.log('getPrice failed: ', error)

        txLabel.innerHTML = 'Something went wrong, try again!'
      })
  }

  const updateValues = () => {

    Erc721Instance.methods.getPrice().call()
      .then((amount) => {
        buyPrice = web3.utils.fromWei(amount)
        const roundPrice = parseFloat(buyPrice).toFixed(4)
        console.log('Price: ', roundPrice)

        btcPriceLabel.innerHTML = roundPrice + ' ' + ethSymbol
      })
      .catch((error) => {
        console.log('getPrice failed: ', error)
      })

    Erc721Instance.methods.maxSupply().call()
      .then((amount) => {
        maxSupply = amount
        pizzasLabel.innerHTML = numberWithCommas(maxSupply - totalSupply - 1250)
      })
      .catch((error) => {
        console.log('maxSupply failed: ', error)
      })

    Erc721Instance.methods.totalSupply().call()
      .then((amount) => {
        totalSupply = amount
        pizzasLabel.innerHTML = numberWithCommas(maxSupply - totalSupply - 1250)
      })
      .catch((error) => {
        console.log('totalSupply failed: ', err)
      })

    Erc721Instance.methods.getBitcoinPriceInWei().call()
      .then((amount) => {
        btcPrice = web3.utils.fromWei(amount)

        console.log('BtcPrice: ', btcPrice)
        const roundPrice2 = parseFloat(buyPrice/btcPrice).toFixed(4)
        ethPriceLabel.innerHTML = roundPrice2 + ' ' + btcSymbol
      })
      .catch((error) => {
        console.log('getBtcPrice failed: ', error)
      })

  }

  const handleUser = () => {
    web3.eth.getAccounts()
      .then(async (accounts) => {
        addresses = accounts

        console.log('accounts: ', accounts)

        if (!accounts.length) {
          walletButton.innerHTML = "Connect Wallet"
        } else {
          walletButton.innerHTML = "<center>Connected</center>"
          await updateBalance()
        }
      }).catch((err) => {
      console.log('Error fetching accounts: ', err)
    })
  }

  const updateBalance = async () => {
    walletAddress = (await web3.eth.getAccounts())[0]

    console.log('Wallet address: ', walletAddress)

    const walletBalance = await web3.eth.getBalance(walletAddress)
    const balance = web3.utils.fromWei(walletBalance)
    const roundedBalance = parseFloat(balance).toFixed(4)

    balanceLabel.innerHTML = roundedBalance + ' ' + ethSymbol

    console.log('ETH balance: ', roundedBalance)
  }

  const buyButtonHandler = () => {
    console.log('Buy button pressed')

    handleUser()

    if (!addresses.length) {
      promptMetamask()
    } else {
      triggerPurchase()
    }
  }

  const walletButtonHandler = () => {
    console.log('Wallet button pressed')

    if (metamaskInstalled) {
      promptMetamask()
    } else {
      window.open('https://www.metamask.io')
    }
  }

  const hide = (element) => {
    console.log("Trying to hide: ", element)
    element.style.display = "none"
  }

  const display = (element) => {
    console.log("Trying to show: ", element)
    element.style.display = "block"
  }

  const startApp = () => {
    console.log('App started')

    Erc721Instance = new web3.eth.Contract(ERC721ABI,ERC721ADDRESS)

    Erc721Instance.events.Transfer((err, e) => { console.log(e) })
      .on('data', (e) =>{
        console.log('event: ', e)

        updateValues()
        //console.log('eventTokenId: ', event['returnedValues']['tokenId']) // TO-DO: get pizza # from here
      })
      .on('changed', (i) => {
        console.log('changed: ', i)
      })
      .on('error on Transfer', console.error)

    updateValues()
    handleUser()
  }

  const initWeb3 = () => {
    if (window.ethereum) {
      console.log('Window.ethereum exists')

      metamaskInstalled = true
      window.web3 = new Web3(window.ethereum)

      startApp()
    } else if (window.web3) {
      console.log('Window.web3 exists')

      metamaskInstalled = true
      window.web3 = new Web3(window.web3.currentProvider)

      startApp()
    } else if (isMobile) {
      console.log('Mobile initiated')

      metamaskInstalled = true
      startApp()
    } else {
      console.log('Non-ethereum browser detected')

      window.alert('Browser not compatible. Try Chrome and MetaMask!')

      txLabel.innerHTML = 'Try Chrome and MetaMask!'
      metamaskInstalled = false
    }
  }

  initWeb3()

  walletButton.addEventListener('click', walletButtonHandler)
  buyButton.addEventListener('click', buyButtonHandler)
}

window.addEventListener('load', onLoadHandler, { once: true })
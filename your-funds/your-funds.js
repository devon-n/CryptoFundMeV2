const contractAbi = contractJson.abi
let contractAddress = address

let funds = []
let provider = ''
let signer = ''
let contract = ''


async function init() {
    let cards = ''
    funds = []
    if (window.ethereum) {
        try {
            // Connect
            provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner()
    
    
            // Check for development
            const networkId = await provider.getNetwork()
            if (networkId.chainId == 1337) contractAddress = ganacheAddress
        
            // Load Contract and funds
            contract = new ethers.Contract(contractAddress, contractAbi, signer)
            await loadFunds(contract)
    
            // If Owner Has No Funds
            if (funds.length == 0) {
                document.querySelector('#card-display').innerHTML = 
                    'You do not have any funds. Create one on our create page.'
                return
            }
    
            // Else Populate Cards
            funds.forEach(fund => {
                cards += `
                <div class="card col-md-5 col-lg-4 col-xl-3 m-3" style="width: 20rem;">
                    <button type="button" class="btn-close position-absolute top-0 end-0 m-1 d-none" aria-label="Close"></button>
                    <img src="${fund.image}" class="img-fluid mt-3 rounded" alt="fund.png" style="height: 250px; width: 350px" />
                    <div class="card-body">
                        <h5 class="card-title">${fund.name}</h5>
                        <p class="card-text text-truncate">${fund.description}</p>
                        <p class=""><strong>Goal:</strong> ${fund.goal}</p>
                        <p class=""><strong>Total Raised:</strong> ${fund.totalRaised} Eth</p>
                        <p class=""><strong>Current Amount:</strong> ${fund.currentAmount} Eth</p>
                        <p class=""><strong>End Date:</strong> ${fund.endDate}</p>
                        <p class=""><strong>ID:</strong> ${fund.id}</p>
                        <button class="secondary-color text-light btn w-100 withdraw-button mb-1" data-withdraw id='${fund.id}'>
                            Withdraw
                        </button>
                    </div>
                </div>
                `
            })
        } catch (err) {
            cards = 
                "<p class='text-center'> \
                    Our contract is not supported on this network. <br/>\
                    Please visit our home page to find supported networks. <br/>\
                    If you would like us to add a network contact us at cfundme@protonmail.com.\
                </p>"
        }
    } else {
        cards = 'Please install a browser wallet (Metamask) to view your funds'
    }
    document.querySelector('#card-display').innerHTML = cards
}

// Load Funds
async function loadFunds(contract) {

    const data = await contract.getFunds();
    const accounts = await window.ethereum.request({method: "eth_requestAccounts"})
    
    // Loop through NFT's to get all data
    const items = await Promise.all(data.map(async i => { 
        const tokenUri = await contract.tokenURI(i.id.toNumber())
        const obj = await (await fetch(tokenUri)).json();

        const raised = Number(i.totalRaised)
        obj.totalRaised = raised / 10**18

        const currentAmount = Number(i.currentAmount)
        obj.currentAmount = currentAmount / 10**18

        const id = Number(i.id)
        obj.id = id

        const owner = await contract.ownerOf(id)

        if (owner.toLowerCase() == accounts[0]) {
            funds.push(obj)
        }
    }))
}

// Withdraw
async function withdraw(id) {

    const transaction = await contract.withdraw(id)
    await transaction.wait()

    window.location.reload()
}


// Load NFTs
await init()


////////////////////////////////////////////// Event Listeners ///////////////////////////

// Withdraw
let withdrawButtons = document.getElementsByClassName('withdraw-button')
withdrawButtons = Array.from(withdrawButtons)
withdrawButtons.forEach(item => {
    item.addEventListener('click', e => {
        const id = e.target.id
        try {
            withdraw(id)
        } catch (err) {
            console.log(err)
        }   
    })
})

// Search
let nfts = document.getElementsByClassName('card')
nfts = Array.from(nfts);
// Search
const searchInput = document.getElementById('search-bar')
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase()
    nfts.forEach(fund => {
        const isVisible = fund.textContent.toLowerCase().includes(value)
        fund.classList.toggle('d-none', !isVisible)
    })
})
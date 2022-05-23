
const contractAbi = contractJson.abi
let contractAddress = address

const infura = 'https://cloudflare-eth.com'

// Global Vars
let provider = ''
let signer = ''
let contract = ''
let funds = []
let cards = ''

async function init() {
    // Reset funds
    funds = []
    if (window.ethereum) {
        try{
            // Connect
            provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner()
            const networkId = await provider.getNetwork()
    
            // Check for development network
            if (networkId.chainId == 1337) contractAddress = ganacheAddress
        
            // Load Contract and funds
            contract = new ethers.Contract(contractAddress, contractAbi, signer)
            await loadFunds(contract)
    
    
            // Loop through funds to create cards
            cards = ''
            funds.forEach(fund => {
                console.log(fund.description)
                cards += `
                <div class="card col-md-5 col-lg-4 col-xl-3 m-3 primary-color" style="width: 20rem;">
                    <button type="button" class="btn-close position-absolute top-0 end-0 m-1 d-none" aria-label="Close"></button>
                    <img src="${fund.image}" class="img-fluid mt-3 rounded" alt="fund.png" style="height: 250px; width: 350px" />
                    <div class="card-body">
                        <h5 class="card-title">${fund.name}</h5>
                            <pre 
                                class="card-text text-truncate text-break description" 
                                style="font-family: 'Avenir', Verdana, sans-serif;">
                                ${fund.description}
                            </pre>
    
                        <p class=""><strong>Goal:</strong> ${fund.goal}</p>
                        <p class=""><strong>Total Raised:</strong> ${fund.totalRaised} Eth</p>
                        <p class=""><strong>End Date:</strong> ${fund.endDate}</p>
                        <button class="secondary-color text-light btn w-100 view-more-button mb-1">
                            View
                        </button>
                        
                        <input type="number" class="form-control d-none mb-1 donate-input" min="0" step="any" id="donate-amount-${fund.id}">
                        <button class="secondary-color text-light btn w-100 donate-button d-none" id="${fund.id}">
                            Donate
                        </button>
                    </div>
                </div>
                `
            })
            // Check if any funds on chain
            if (funds.length < 1) cards = 'There are no funds on this chain yet. You can create the first.'
        } catch (err) {
            cards = 
                "<p class='text-center'> \
                    Our contract is not supported on this network. <br/>\
                    Please visit our home page to find supported networks. <br/>\
                    If you would like us to add a network contact us at cfundme@protonmail.com.\
                </p>"
        }
        
        document.querySelector('#card-display').innerHTML = cards

    } else {
        try {
            const provider = new ethers.providers.JsonRpcProvider(infura, 1)
    
            // Load Contract and funds
            const contract = new ethers.Contract(contractAddress, contractAbi, provider)
            await loadFunds(contract)
    
            // Loop through funds to create cards
            cards = ""
            if (funds.length > 0) {
                cards = "<p class='text-center'> You will need a Web3 wallet (Metamask) to donate to the funds.</p>"
                funds.forEach(fund => {
                    cards += `
                    <div class="card col-md-5 col-lg-4 col-xl-3 m-3" style="width: 20rem;">
                        <button type="button" class="btn-close position-absolute top-0 end-0 m-1 d-none" aria-label="Close"></button>
                        <img src="${fund.image}" class="img-fluid mt-3 rounded" alt="fund.png" style="height: 250px; width: 350px" />
                        <div class="card-body">
                            <h5 class="card-title">${fund.name}</h5>
                            <pre 
                                class="card-text text-truncate text-break description" 
                                style="font-family: 'Avenir', Verdana, sans-serif;">
                                ${fund.description}
                            </pre>
                            <p class=""><strong>Goal:</strong> ${fund.goal}</p>
                            <p class=""><strong>Total Raised:</strong> ${fund.totalRaised} Eth</p>
                            <p class=""><strong>End Date:</strong> ${fund.endDate}</p>
                            <button class="secondary-color text-light btn w-100 view-more-button mb-1">
                                View
                            </button>
                            
                            <input type="number" class="form-control d-none mb-1 donate-input" min="-1" id="donate-amount-${fund.id}">
                            <button class="secondary-color text-light btn w-100 donate-button d-none" id="${fund.id}">
                                Donate
                            </button>
                        </div>
                    </div>
                    `
                })
            } else {
                cards = 'There are no funds on this chain yet. You can create the first.'
            }
        } catch (err) {
            cards = 'Please install a browser wallet (Metamask) to view the funds'
        }
        document.querySelector('#card-display').innerHTML = cards
    }
}


async function loadFunds(contract) {
    // Get Funds
    const data = await contract.getFunds();
    // Loop through NFT's to get all data
    const items = await Promise.all(data.map(async i => {
        
        const tokenUri = await contract.tokenURI(i.id.toNumber())
        const obj = await (await fetch(tokenUri)).json();

        const raised = Number(i.totalRaised)
        obj.totalRaised = raised / 10**18

        const id = Number(i.id)
        obj.id = id

        funds.push(obj)
    }))
}

// Donate
async function donate(id, value) {

    // Input field
    let donateValue = await ethers.utils.parseUnits(value.toString(), 'ether')
    const transaction = await contract.donate(id, { value: await ethers.utils.parseUnits(value.toString(), 'ether')}) 

    // Wait for transaction to go through
    await transaction.wait() 
    window.location.reload()
  }

// Load NFTs
await init()

///////////////////////////////////// Event Listeners ///////////////////////////////////////

// Get Cards
let nfts = document.getElementsByClassName('card')
nfts = Array.from(nfts);

// Open and Close Cards
nfts.forEach(item => {
    
    // Focus on Card
    item.getElementsByClassName('view-more-button')[0].addEventListener('click', event => {
        
        // Check if not focused
        if (!item.classList.contains('focused')){

            // Unfocus all other cards
            document.querySelectorAll('.card').forEach(item => {
                item.classList.remove('w-75')
                item.classList.remove('focused')
                item.getElementsByClassName('btn-close')[0].classList.add('d-none')
                item.getElementsByClassName('img-fluid')[0].classList.remove('mx-sm-3')
                item.getElementsByClassName('description')[0].classList.add('text-truncate')
                item.getElementsByClassName('view-more-button')[0].classList.remove('d-none')
                item.getElementsByClassName('donate-input')[0].classList.add('d-none')
                item.getElementsByClassName('donate-button')[0].classList.add('d-none')
            })  
            
            // Focus on current card
            item.classList.toggle('w-75')
            item.classList.toggle('focused')
            item.getElementsByClassName('btn-close')[0].classList.toggle('d-none')
            item.getElementsByClassName('img-fluid')[0].classList.toggle('mx-sm-3')
            item.getElementsByClassName('description')[0].classList.toggle('text-truncate')
            item.getElementsByClassName('view-more-button')[0].classList.toggle('d-none')
            item.getElementsByClassName('donate-input')[0].classList.toggle('d-none')
            item.getElementsByClassName('donate-button')[0].classList.toggle('d-none')
            item.scrollIntoView(true, {behavior: 'smooth', block: 'nearest'})
            item.getElementsByClassName('description')[0].style.cssText = "white-space: pre-line; font-family: 'Avenir', Verdana, sans-serif;"
        }
    })

    // Close card
    item.children[0].addEventListener('click', event => {

        // Check if focused
        if(item.classList.contains('focused')) {

            // Unfocus on current card
            item.classList.remove('w-75')
            item.classList.remove('focused')
            item.getElementsByClassName('btn-close')[0].classList.add('d-none')
            item.getElementsByClassName('img-fluid')[0].classList.remove('mx-sm-3')
            item.getElementsByClassName('description')[0].classList.add('text-truncate')
            item.getElementsByClassName('view-more-button')[0].classList.remove('d-none')
            item.getElementsByClassName('donate-input')[0].classList.add('d-none')
            item.getElementsByClassName('donate-button')[0].classList.add('d-none')
            item.getElementsByClassName('description')[0].style.cssText = "font-family: 'Avenir', Verdana, sans-serif;"
        }
    })
})

// Search
const searchInput = document.getElementById('search-bar')
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase()
    nfts.forEach(fund => {
        const isVisible = fund.textContent.toLowerCase().includes(value)
        fund.classList.toggle('d-none', !isVisible)
    })
})

// Donate Value
let donateId = ''
let donateValue = ''
let donateInputs = document.getElementsByClassName('donate-input')
donateInputs = Array.from(donateInputs)
donateInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        donateValue = e.target.value
        donateId = e.target.id.replace( /^\D+/g, '')
    })
})

// Donate Submit

let donateSubmit = document.getElementsByClassName('donate-button')
donateSubmit = Array.from(donateSubmit)

if (!window.ethereum){
    donateSubmit.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            alert('You will need a Web3 wallet (Metamask) to donate to the funds.')
        })
    })
} else {
    donateSubmit.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            donate(donateId, donateValue)
        })
    })    
}


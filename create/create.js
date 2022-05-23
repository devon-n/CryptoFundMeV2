const contractAbi = contractJson.abi
let contractAddress = address


const form = document.getElementById('create-form')
const imageSubmit = document.getElementById('image')
const submitButton = document.getElementById('submit')

const client = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
let image = null


function submitForm() {
    const name = form[0].value
    const description = form[1].value
    const goal = form[2].value
    const endDate = form[3].value
    return {name, description, goal, endDate}
}


async function uploadImage(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      image = `https://ipfs.infura.io/ipfs/${added.path}`
    } catch (error) {
      console.log('Error uploading file: ', error)
    } 
}

// Create Metadata
async function uploadMetadata(name, description, goal, endDate, image) {
    console.log('Descrition: ', description)
    const data = JSON.stringify({
        name, description, goal, endDate, image
    })

    console.log('Data: ', data)

    try {
        const added = await client.add(data)
        const metadataUrl = `https://ipfs.infura.io/ipfs/${added.path}`
        return metadataUrl
    } catch (err) {
        console.log(err)
    }
}

// Create a fund
async function createFund(name, description, goal, endDate, image) {
    
    if (window.ethereum) {

        // Upload Metadata
        const metadataUrl = await uploadMetadata(name, description, goal, endDate, image)

        // Connect to blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        // Check for development
        const networkId = await provider.getNetwork()
        if (networkId.chainId == 1337) contractAddress = ganacheAddress

        // Convert Goal to Wei
        let goalEther = ethers.utils.parseEther(goal.toString())
        goalEther = ethers.utils.formatUnits(goalEther.toString(), 'wei')

        try {
            // Init contract
            const tokenContract = new ethers.Contract(contractAddress, contractAbi, signer) // get token contract

            // Convert date to timestamp
            let date = new Date(endDate)
            let timestamp = date.getTime() / 1000
            
            // Send transaction
            let transaction = await tokenContract.createFund(
                timestamp, goalEther, metadataUrl
            )
            await transaction.wait() // wait for transaction
            
            window.location.href = window.location.href.replace('/create/', '/your-funds/')
        } catch (err) {
            console.log(err)
            console.log(err.code)
            if(err.code) return
            if(err.code !== 4001){
                alert("Error: Contract not found. Please change your network to one that supports CryptoFundMe. You can find them on our home page")
            }
        }
    } else {
        alert('Please install a browser wallet (ie. Metamask) to create a fund.')
    }   
}

////////////////////////////////////// Event Listeners ///////////////////////////////////////

imageSubmit.addEventListener('change', (e) => {
    uploadImage(e)
})

submitButton.addEventListener('click', (e) => {
    e.preventDefault()
    if (image == null) {
        alert('Please wait while we upload your image to the blockchain. Please click submit again in a few seconds.')
        return
    }
    const {name, description, goal, endDate} = submitForm()
    createFund(name, description, goal, endDate, image)
})
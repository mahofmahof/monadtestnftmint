// Monad Testnet ayarları
const RPC_URL = "https://testnet-rpc.monad.xyz";
const CHAIN_ID = "10143"; // Hex olarak 0x27af
const CONTRACT_ADDRESS = "0xE47B7528088a13001db162DDc3148F71C1ae88d0";

// Basitleştirilmiş ABI (sadece claim fonksiyonu için)
const CONTRACT_ABI = [
    {
        "constant": false,
        "inputs": [
            {"name": "_receiver", "type": "address"},
            {"name": "_quantity", "type": "uint256"},
            {"name": "_currency", "type": "address"},
            {"name": "_pricePerToken", "type": "uint256"},
            {"name": "_allowlistProof", "type": "bytes32[]"},
            {"name": "_data", "type": "bytes"}
        ],
        "name": "claim",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    }
];

// Web3 nesnesini oluştur
const web3 = new Web3(RPC_URL);
let account;
let contract;

// DOM elemanları
const connectWalletBtn = document.getElementById("connectWallet");
const mintNFTBtn = document.getElementById("mintNFT");
const walletAddress = document.getElementById("walletAddress");
const status = document.getElementById("status");

// Monad Testnet'e geçiş yapma
async function switchToMonadTestnet() {
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x27af" }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: "0x27af",
                    chainName: "Monad Testnet",
                    rpcUrls: [RPC_URL],
                    nativeCurrency: {
                        name: "Monad",
                        symbol: "MONAD",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://testnet.monadexplorer.com"]
                }],
            });
        } else {
            throw switchError;
        }
    }
}

// Cüzdan bağlama
connectWalletBtn.addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            // Cüzdan izni al
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            account = accounts[0];
            walletAddress.textContent = `Cüzdan: ${account}`;
            
            // Monad Testnet'e geç
            await switchToMonadTestnet();
            
            // Web3 provider'ı MetaMask ile güncelle
            web3.setProvider(window.ethereum);
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            
            // Mint butonunu aktif et
            mintNFTBtn.disabled = false;
            status.textContent = "Durum: Cüzdan bağlı, mint etmeye hazır!";
        } catch (error) {
            status.textContent = `Hata: ${error.message}`;
        }
    } else {
        status.textContent = "Hata: MetaMask yüklü değil!";
    }
});

// NFT claim etme
mintNFTBtn.addEventListener("click", async () => {
    if (!account || !contract) {
        status.textContent = "Hata: Önce cüzdanı bağla!";
        return;
    }

    try {
        status.textContent = "Durum: Claim işlemi başlatılıyor...";
        
        // Claim parametreleri
        const receiver = account; // NFT'nin gönderileceği adres
        const quantity = 1; // Kaç tane NFT claim edilecek
        const currency = "0x0000000000000000000000000000000000000000"; // Native token (MONAD)
        const pricePerToken = "0"; // Ücretsiz claim
        const allowlistProof = []; // İzin listesi yoksa boş
        const data = "0x"; // Ekstra veri yoksa boş

        // Claim işlemi (ücretsiz olduğu için value yok)
        await contract.methods.claim(
            receiver,
            quantity,
            currency,
            pricePerToken,
            allowlistProof,
            data
        ).send({ from: account });

        status.textContent = `Başarılı! ${quantity} NFT claim edildi!`;
    } catch (error) {
        status.textContent = `Hata: ${error.message}`;
    }
});

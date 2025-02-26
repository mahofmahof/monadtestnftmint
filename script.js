// Web3 zaten CDN ile yüklendiği için global Web3'ü kullan
let web3;
let account;
let contract;

// Monad Testnet ayarları
const RPC_URL = "https://testnet-rpc.monad.xyz";
const CHAIN_ID = "10143"; // Hex olarak 0x279f
const CONTRACT_ADDRESS = "0x88510D9c0A3dbD4924D870254ef6F378d8a76980";

// Yeni kontrat için ABI
const CONTRACT_ABI = [
    {
        "constant": false,
        "inputs": [
            {"name": "quantity", "type": "uint256"}
        ],
        "name": "mint",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// DOM yüklendikten sonra çalış
document.addEventListener("DOMContentLoaded", () => {
    web3 = new Web3(RPC_URL);

    const connectWalletBtn = document.getElementById("connectWallet");
    const mintNFTBtn = document.getElementById("mintNFT");
    const mintFiveNFTsBtn = document.getElementById("mintFiveNFTs"); // Yeni buton
    const walletAddress = document.getElementById("walletAddress");
    const status = document.getElementById("status");

    if (!connectWalletBtn) {
        console.error("Hata: connectWallet butonu bulunamadı!");
        return;
    }
    if (!mintNFTBtn) {
        console.error("Hata: mintNFT butonu bulunamadı!");
        return;
    }
    if (!mintFiveNFTsBtn) {
        console.error("Hata: mintFiveNFTs butonu bulunamadı!");
        return;
    }

    async function switchToMonadTestnet() {
        try {
            console.log("Ağ değiştirme işlemi başlatılıyor...");
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x279f" }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                console.log("Ağ ekleniyor...");
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId: "0x279f",
                        chainName: "Monad Testnet",
                        rpcUrls: [RPC_URL],
                        nativeCurrency: {
                            name: "Monad",
                            symbol: "MON",
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

    connectWalletBtn.addEventListener("click", async () => {
        console.log("Cüzdan bağlama butonuna basıldı!");
        if (typeof window.ethereum !== "undefined") {
            try {
                console.log("MetaMask tespit edildi, cüzdan izni isteniyor...");
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                account = accounts[0];
                walletAddress.textContent = `Cüzdan: ${account}`;
                
                console.log("Monad Testnet'e geçiş yapılıyor...");
                await switchToMonadTestnet();
                
                console.log("Web3 provider güncelleniyor...");
                web3.setProvider(window.ethereum);
                contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                
                mintNFTBtn.disabled = false;
                mintFiveNFTsBtn.disabled = false; // Yeni buton aktif
                status.textContent = "Durum: Cüzdan bağlı, MON ile mint etmeye hazır!";
            } catch (error) {
                status.textContent = `Hata: ${error.message}`;
                console.error("Cüzdan bağlama hatası:", error);
            }
        } else {
            status.textContent = "Hata: MetaMask yüklü değil!";
            console.error("MetaMask bulunamadı!");
        }
    });

    // Tek NFT mint etme
    mintNFTBtn.addEventListener("click", async () => {
        if (!account || !contract) {
            status.textContent = "Hata: Önce cüzdanı bağla!";
            return;
        }

        try {
            status.textContent = "Durum: Mint işlemi başlatılıyor...";
            console.log("Mint işlemi başlatıldı...");
            
            const quantity = 1;

            await contract.methods.mint(quantity).send({ from: account });

            status.textContent = `Başarılı! ${quantity} NFT MON ile mint edildi!`;
        } catch (error) {
            status.textContent = `Hata: ${error.message}`;
            console.error("Mint hatası:", error);
        }
    });

    // 5 NFT mint etme
    mintFiveNFTsBtn.addEventListener("click", async () => {
        if (!account || !contract) {
            status.textContent = "Hata: Önce cüzdanı bağla!";
            return;
        }

        try {
            status.textContent = "Durum: 5 NFT mint işlemi başlatılıyor...";
            console.log("5 NFT mint işlemi başlatıldı...");
            
            const quantity = 5;

            await contract.methods.mint(quantity).send({ from: account });

            status.textContent = `Başarılı! ${quantity} NFT MON ile mint edildi!`;
        } catch (error) {
            status.textContent = `Hata: ${error.message}`;
            console.error("Mint hatası:", error);
        }
    });
});

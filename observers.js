const from  = rxjs.from
const takeUntil = rxjs.takeUntil
const Web3Modal = window.Web3Modal.default;
let isAuth=0;
var WalletConnectProvider=WalletConnectProvider.default;
const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        bridge: "https://bridge.walletconnect.org",
        rpc: {
            56: "https://bsc-dataseed1.binance.org",
        },
        chainId: 56,
        network: "binance",
  
        }
    }
  }

const anyProviderObserver =
     async() => {
        try {
        provider=new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org');
        const providerWrapper = new ethers.providers.Web3Provider(provider)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, providerWrapper)
        setGlobalStatisticsEvents(contract)
    }
    catch(Exception){
        console.log(Exception)
    }
    onNoWalletsConnected()        
    }

const walletChoosingObserver =  async() => {
        try {
                web3Modal = new Web3Modal({
                    network: "binance", // replace mainnet to binance
                    providerOptions, // required
                });
                provider = await web3Modal.connect().catch(e => {
                    console.log(e);
                });
            
            //console.log(provider.chainId);
                console.log(provider);
                if(provider!=null)
                {
                    if(provider.chainId!=0x38)
                    {
                        console.log(" other network");
                        try{
                          await window.ethereum.request({
                              method: 'wallet_switchEthereumChain',
                              params: [{ chainId: '0x38' }],
                            });
                          } catch (switchError) {
                           
                            // This error code indicates that the chain has not been added to MetaMask.
                            if (switchError.code === 4902) {
                              try {

                               const res =  await window.ethereum.request({
                                  method: 'wallet_addEthereumChain',
                                  params: [
                                    {
                                      chainId: '0x38',
                                      chainName: 'Binance SmartChain Mainnet',
                                      nativeCurrency: {
                                        name: 'Binance',
                                        symbol: 'BNB',
                                        decimals: 18
                                      },
                                      rpcUrls: ['https://bsc-dataseed1.binance.org'],
                                      blockExplorerUrls: ['https://bscscan.com/']
                                    }
                                  ],
                                });

                              } catch (addError) {

                                alert(addError);
                              }
                            }
                            // handle other "switch" errors
                          }
                        //switchnetwork(Contract, web3, account[0]);
                    }
                    else
                    {
                        const providerWrapper = new ethers.providers.Web3Provider(provider)
                        const signer = providerWrapper.getSigner()
                        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)

                        const accountsChangeObservable = accountsChangeObservableFactory(provider)
                        accountsChangeObservable.subscribe(accounts => setPersonalStatisticsEvents(providerWrapper, contract, accounts[0]))
                        const requestAccountObservable = from(requestAccounts(provider)).pipe(takeUntil(accountsChangeObservable)) 
                        requestAccountObservable.subscribe(accounts => setPersonalStatisticsEvents(providerWrapper, contract, accounts[0]))
                        setGlobalStatisticsEvents(contract)
                    }
                }
                else
                {
                    console.log("empty provider")
                }
            
        }
        catch(Exception){
            console.log(Exception)
        }
        
    }

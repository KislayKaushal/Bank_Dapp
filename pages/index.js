import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";


export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionCount, setTransactionCount] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }
  
  const getTransactionCount = async () => {
    if (ethWallet && account) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      const count = await provider.getTransactionCount(accountAddress);
      setTransactionCount(count);
    }
  };
  

  const deposit = async() => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait()
      getBalance();
    }
  }

  const withdraw = async() => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait()
      getBalance();
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    const styles = {
      screenContainer: {
        margin: "10px 10px 10px 10px",
        height: '30px',
        width: 'fit-content',
        borderRadius: '20px',
        background: 'cadetblue',
        fontWeight: 'bold'
      }

    };

    return (
      <div>
        <div style={{
          backgroundColor: 'grey',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection:'column',
          height: '25vh',
          
          }}>
          <p style={{
            fontFamily: "cursive",
            FontFaceSet: "larger",
            fontWeight: 'bold'
          }}
          >Your Account: {account}</p>
          <p style={{
            fontFamily: "cursive",
            fontSize: "large",
            fontWeight: 'bold'
          }}
          >Your Balance: {balance}</p>
        </div>
        <button style={styles.screenContainer}onClick={deposit}>Deposit 1 ETH</button>
        <button style={styles.screenContainer} onClick={withdraw}>Withdraw 1 ETH</button>
        <button style={styles.screenContainer} onClick={getTransactionCount}>Get Transaction Count: {transactionCount}</button>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )

  
}
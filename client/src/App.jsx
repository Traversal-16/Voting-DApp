import { useState,useEffect } from 'react'
import { ethers } from 'ethers';
import Login from './components/Login';
import Connected from './components/Connected';
import './App.css'
import abi from './contractJson/Voting.json';
import Finished from './components/Finished';

function App() 
{
  const contractABI=abi.abi;
  const contractAddress="0xF842447b57696Fd9E06ED2079031405093731660";
  const[provider,setProvider]=useState(null);
  const[account,setAccount]=useState (null);
  const[isConnected,setIsConnected]=useState (false);
  const [votingStatus,setVotingStatus]=useState (true);
  const[remainingTime,setremainingTime]=useState('');
  const[candidates,setCandidates]=useState ([]);
  const[number,setNumber]=useState ('');
  const[canVote,setCanVote]=useState (true);
  
  useEffect( () => 
  {
    //setVotingStatus (false);
    getCandidates();
    getremainingTime();
    getCurrentStatus();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return() => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    }
  });

  function handleAccountsChanged(accounts) 
  {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      canvote ();
      
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  

  async function getCurrentStatus ()
  {
    const provider=new ethers.BrowserProvider (window.ethereum);
    await provider.send("eth_requestAccounts",[]);
    const signer= await provider.getSigner ();
    const contract=new ethers.Contract (contractAddress,contractABI,signer);
    const status=await contract.getVotingStatus ();
    //console.log (status);
    setVotingStatus (status);
  }


  async function getremainingTime ()
  {
    const provider=new ethers.BrowserProvider (window.ethereum);
    await provider.send("eth_requestAccounts",[]);
    const signer= await provider.getSigner ();
    const contract=new ethers.Contract (contractAddress,contractABI,signer);
    const remain=await contract.getRemainingTime ();
    //console.log (parseInt(remain, 16));
    setremainingTime ((parseInt(remain, 16)));
  }



  async function getCandidates() 
  {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer =await provider.getSigner();
    const contractInstance = new ethers.Contract (
      contractAddress, contractABI, signer
    );
    const candidatesList = await contractInstance.getAllVotesOfCandidates();
    const formattedCandidates=candidatesList.map((candidate,index)=>
      {
        return {
          index: index,
          name: candidate.name,
          voteCount: ((Number)(candidate.voteCount))
        }
      });
      setCandidates (formattedCandidates);
  }

  async function connectToMetamask ()
  {
    if (window.ethereum)
    {
      try{
        const provider=new ethers.BrowserProvider (window.ethereum);
        setProvider (provider);
        await provider.send ("eth_requestAccounts",[]);
        const signer= await provider.getSigner ();
        const address=await signer.getAddress ();
        
        setAccount (address);
        //console.log (address);
        setIsConnected (true);
        canvote ();
      }
      catch (err)
      {
        console.log (err);
      }
    }
    else{
      alert ("METAMASK ISN'T DETECTED IN THE BROWSER");
    }
  }

  async function handleNumberChange (e)
  {
    setNumber (e.target.value);
  }

  async function canvote ()
  {
    const provider=new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts",[]);
    const signer=await provider.getSigner ();
    const contract =new ethers.Contract (contractAddress,contractABI,signer);
    const voteStatus=await contract.voters(await signer.getAddress());
    setCanVote (voteStatus);
  }

  async function vote ()
  {
    const provider=new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts",[]);
    const signer=await provider.getSigner ();
    const contract =new ethers.Contract (contractAddress,contractABI,signer);
    const tx=await contract.vote (number);
    await tx.wait ();
    alert ("Transaction is SuccessFul.")
    canvote ();
    
  }
  return (
    <div className='App'>
      {votingStatus ?(isConnected ?(<Connected 
                       account={account}
                       candidates={candidates}
                       remainingTime={remainingTime}
                       number={number}
                       handleNumberChange={handleNumberChange}
                       voteFunction={vote}
                       showButton={canVote}/>):(<Login connectWallet={connectToMetamask}/>)):(<Finished ></Finished>)}
      
    </div>
  )
}

export default App

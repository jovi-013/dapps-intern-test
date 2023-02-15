import PageWrapper from "../components/PageWrapper";
import { useEffect, useState } from 'react';
import { Button, Heading, Pane, Text, TextInput, TextInputField } from "evergreen-ui";
import Web3 from "web3";
import { ERC20_ABI, ERC20_ADDRESS } from "../erc20-config";
import { ERC721_ABI, ERC721_ADDRESS } from "../erc721-config";
import { _getBalance, _getTokenName, _getTokenStatus, _getTokenSymbol, _getTotalSupply } from "../helper";

function TokenPage() {
  const [account, setAccount] = useState();
  const [tokenType, setTokenType] = useState();

  const [web3Connection, setWeb3Connection] = useState();
  const [ERC20Contract, setERC20Contract] = useState();
  const [ERC721Contract, setERC721Contract] = useState();

  const [tokenName, setTokenName] = useState();
  const [tokenSymbol, setTokenSymbol] = useState();
  const [totalSupply, setTotalSupply] = useState();
  const [balance, setBalance] = useState();

  const [mintTargetAddress, setMintTargetAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");

  const [transferTargetAddress, setTransferTargetAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const [tokenStatus, setTokenStatus] = useState("");
  const [burnTokenId, setBurnTokenId] = useState("");

  const [txHash, setTxHash] = useState();
  const [txHashRenderLocation, setTxHashRenderLocation] = useState();

  const [isLoading, setIsLoading] = useState();

  const blockchainExplorer = "https://goerli.etherscan.io/tx/";

  async function requestAccount() {
    console.log('Requesting account...');

    if(window.ethereum) {
      console.log('detected');

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.log('Error connecting...');
      }
    } else {
      alert('Metamask not detected');
    }
  }

  useEffect(() => {
    async function getContractWrapper() {
      const web3 = new Web3("https://goerli.infura.io/v3/" + process.env.REACT_APP_TESTNET_KEY);
      setERC20Contract(new web3.eth.Contract(ERC20_ABI, ERC20_ADDRESS));
      setERC721Contract(new web3.eth.Contract(ERC721_ABI, ERC721_ADDRESS));
      setWeb3Connection(web3);
    }
    getContractWrapper();
  }, [])

  useEffect(() => {
    async function getDataWrapper() {    
      if (isLoading) {
        setTokenName();
        setTokenSymbol();
        setTotalSupply();
        setBalance();
      }
      if (ERC20Contract && account && tokenType === "ERC20") {
        setTokenName(await _getTokenName(ERC20Contract));
        setTokenSymbol(await _getTokenSymbol(ERC20Contract));
        setTotalSupply(await web3Connection.utils.fromWei(await _getTotalSupply(ERC20Contract), 'ether'));
        setBalance(await web3Connection.utils.fromWei(await _getBalance(ERC20Contract, account), 'ether'));
      }
      else if (ERC721Contract && account && tokenType === "ERC721") {
        setTokenName(await _getTokenName(ERC721Contract));
        setTokenSymbol(await _getTokenSymbol(ERC721Contract));
        setTotalSupply(await _getTotalSupply(ERC721Contract));
        setBalance(await _getBalance(ERC721Contract, account));
        setTokenStatus(await _getTokenStatus(ERC721Contract));
      }
      setIsLoading(false);
    }
    getDataWrapper()
  }, [tokenType])

  function txReceipt() {
    return (
      <Pane 
        display="flex" flexDirection="column" marginBottom="30px" width="30%"
      >
        <Text>Your transaction hash: </Text>
        <a 
          href={blockchainExplorer + txHash} 
          target="_blank"
        >
          <Text size={300}>{txHash}</Text>
        </a>
      </Pane>
    )
  }

  return (
    <PageWrapper>
      {account 
        ? <Pane>
            <Text>Account:</Text>
            <Button marginX="10px">{account}</Button>
            <Pane marginY="15px">
              <Text>Select token type:</Text>
              <Button 
                marginLeft="10px" 
                onClick={() => {
                  setIsLoading(true);
                  setTokenType("ERC20");
                }}
              >
                ERC20
              </Button>
              <Button 
                marginLeft="10px" 
                onClick={() => {
                  setIsLoading(true);
                  setTokenType("ERC721");
                }}
              >
                ERC721
              </Button>
            </Pane>
          </Pane>
        : <Button onClick={async () => requestAccount()}>Connect Wallet</Button>
      }

      {account && tokenType &&
        <Pane>
          <Heading>{tokenType}</Heading>
          <Heading>Contract Address: 
            <Button>
              {(tokenType === "ERC20") && ERC20_ADDRESS}
              {(tokenType === "ERC721") && ERC721_ADDRESS}
            </Button>
          </Heading>
        </Pane>
      }
      
      {account && (tokenType === "ERC20") &&
        <Pane display="flex" flexDirection="column">
          <Text marginY="4px">Token Name: {tokenName}</Text>
          <Text>Token Symbol: {tokenSymbol}</Text>
          <Pane>
            <Text>Total Supply: {totalSupply}</Text>
            <Button 
              onClick={async () => {
                setTotalSupply();
                setTotalSupply(await web3Connection.utils.fromWei(await _getTotalSupply(ERC20Contract), 'ether'));
              }} 
              marginLeft="10px"
            >
              Refresh
            </Button>
          </Pane>

          <Pane>
            <Text>Your Balance: {balance}</Text>
            <Button 
              onClick={async () => {
                setBalance();
                setBalance(await web3Connection.utils.fromWei(await _getBalance(ERC20Contract, account), 'ether'));
              }} 
              marginLeft="10px"
            >
              Refresh
            </Button>
          </Pane>

          <hr/>
          <TextInputField
            label="Mint token"
            description="To address"
            placeholder="0x031705d75fc32e94e815f62fb9AfD524C7a1B20a"
            value={mintTargetAddress}
            onChange={e => setMintTargetAddress(e.target.value)}
            width="30%"
            marginBottom="0px"
          />
          <Text size={300} color="gray700" marginBottom="9px" marginTop="6px">
            Mint amount
          </Text>
          <TextInput
            placeholder="1000"
            value={mintAmount}
            onChange={e => {setMintAmount(e.target.value)}}
            width="30%"
          />
          <Button 
            width="30%" marginY="25px"
            onClick={async () => {
              const _mintAmount = await web3Connection.utils.toWei(mintAmount, "ether")
              const transactionParameters = {
                from: account,
                to: ERC20_ADDRESS,
                data: ERC20Contract.methods.mint(mintTargetAddress, _mintAmount).encodeABI(),
              };
              const transactionHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters]
              })
              setTxHash(transactionHash);
              setTxHashRenderLocation("a1");
            }}
          >
            Mint
          </Button>

          {txHashRenderLocation === "a1" && txReceipt()}

          <TextInputField
            label="Transfer"
            description="To address"
            placeholder="0x031705d75fc32e94e815f62fb9AfD524C7a1B20a"
            value={transferTargetAddress}
            onChange={e => setTransferTargetAddress(e.target.value)}
            width="30%"
            marginBottom="0"
          />
          <Text size={300} color="gray700" marginBottom="9px" marginTop="6px">
            Transfer amount
          </Text>
          <TextInput
            placeholder="1000"
            value={transferAmount}
            onChange={e => {setTransferAmount(e.target.value)}}
            width="30%"
          />
          <Button 
            width="30%" marginY="25px"
            onClick={async () => {
              const _transferAmount = await web3Connection.utils.toWei(transferAmount, "ether")
              const transactionParameters = {
                from: account,
                to: ERC20_ADDRESS,
                data: ERC20Contract.methods.transfer(transferTargetAddress, _transferAmount).encodeABI(),
              };
              const transactionHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters]
              })
              setTxHash(transactionHash);
              setTxHashRenderLocation("a2");
            }}
          >
            Transfer
          </Button>

          {txHashRenderLocation === "a2" && txReceipt()}
        </Pane>
      }

      {account && (tokenType === "ERC721") &&
        <Pane display="flex" flexDirection="column">
          <Text marginY="4px">Token Name: {tokenName}</Text>
          <Text>Token Symbol: {tokenSymbol}</Text>
          <Pane>
            <Text>Total Supply: {totalSupply}</Text>
            <Button 
              onClick={async () => {
                setTotalSupply();
                setTotalSupply(await _getTotalSupply(ERC721Contract));
              }} 
              marginLeft="10px"
            >
              Refresh
            </Button>
          </Pane>
          <Pane>
            <Text>Your Balance: {balance}</Text>
            <Button 
              onClick={async () => {
                setBalance();
                setBalance(await _getBalance(ERC721Contract, account));
              }} 
              marginLeft="10px"
            >
              Refresh
            </Button>
          </Pane>

          <hr/>
          <Pane display="flex" flexDirection="row" alignItems="center">
            <Text marginRight="10px">
              Token status: {tokenStatus && !isLoading && "Paused"} {!tokenStatus && !isLoading && "Normal / Running / Unpaused"}
            </Text>

            {tokenStatus && !isLoading &&
               <Button appearance="primary" intent="danger"
                  onClick={async () => {
                    const transactionParameters = {
                      from: account,
                      to: ERC721_ADDRESS,
                      data: ERC721Contract.methods.unpause().encodeABI(),
                    };
                    const transactionHash = await window.ethereum.request({
                      method: "eth_sendTransaction",
                      params: [transactionParameters]
                    })
                    setTxHash(transactionHash);
                    setTxHashRenderLocation("b1");
                  }}
                >
                  Unpause token
                </Button>
            }
            {!tokenStatus && !isLoading &&
              <Button appearance="primary" intent="none"
                onClick={async () => {
                  const transactionParameters = {
                    from: account,
                    to: ERC721_ADDRESS,
                    data: ERC721Contract.methods.pause().encodeABI(),
                  };
                  const transactionHash = await window.ethereum.request({
                    method: "eth_sendTransaction",
                    params: [transactionParameters]
                  })
                  setTxHash(transactionHash);
                  setTxHashRenderLocation("b1");
                }}
              >
                Pause token
              </Button>
            }
            <Button 
              onClick={async () => {
                setIsLoading(true);
                setTokenStatus(await _getTokenStatus(ERC721Contract));
                setIsLoading(false);
              }}
              marginLeft="10px"
            >
              Refresh
            </Button>
          </Pane>

          {txHashRenderLocation === "b1" && txReceipt()}

          <hr/>
          <TextInputField
            label="Mint token"
            description="To address"
            placeholder="0x031705d75fc32e94e815f62fb9AfD524C7a1B20a"
            value={mintTargetAddress}
            onChange={e => setMintTargetAddress(e.target.value)}
            width="30%"
            marginBottom="0px"
          />
          <Button
            width="30%" marginY="25px"
            onClick={async () => {
              const transactionParameters = {
                from: account,
                to: ERC721_ADDRESS,
                data: ERC721Contract.methods.safeMint(mintTargetAddress).encodeABI(),
              };
              const transactionHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters]
              })
              setTxHash(transactionHash);
              setTxHashRenderLocation("b2");
            }}
          >
            Mint
          </Button>

          {txHashRenderLocation === "b2" && txReceipt()}

          <TextInputField
            label="Burn token"
            description="Token ID"
            placeholder="1"
            value={burnTokenId}
            onChange={e => setBurnTokenId(e.target.value)}
            width="30%"
            marginBottom="0px"
          />
          <Button
            width="30%" marginY="25px"
            onClick={async () => {
              const transactionParameters = {
                from: account,
                to: ERC721_ADDRESS,
                data: ERC721Contract.methods.burn(burnTokenId).encodeABI(),
              };
              const transactionHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters]
              })
              setTxHash(transactionHash);
              setTxHashRenderLocation("b3");
            }}
          >
            Burn
          </Button>

          {txHashRenderLocation === "b3" && txReceipt()}

        </Pane>
      }
      
    </PageWrapper>
  )
}

export default TokenPage;
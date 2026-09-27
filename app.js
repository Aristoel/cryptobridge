let walletAddress = null;
let currentChainId = null;

/* =========================
   WALLET CONNECTION
========================= */

async function connectWallet() {
  if (!window.ethereum) {
    alert(
      "No compatible crypto wallet was detected.\n\n" +
      "Install a wallet such as MetaMask, then open CryptoBridge again."
    );
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    if (!accounts || !accounts.length) {
      return;
    }

    walletAddress = accounts[0];

    await updateWalletInfo();

    alert(
      "Wallet connected!\n\n" +
      formatAddress(walletAddress)
    );

  } catch (error) {
    console.error(error);
    alert("Wallet connection was cancelled or failed.");
  }
}


/* =========================
   WALLET INFORMATION
========================= */

async function updateWalletInfo() {
  if (!window.ethereum || !walletAddress) {
    return;
  }

  try {
    currentChainId = await window.ethereum.request({
      method: "eth_chainId"
    });

    const balanceHex = await window.ethereum.request({
      method: "eth_getBalance",
      params: [walletAddress, "latest"]
    });

    const balanceWei = BigInt(balanceHex);

    const balanceEth =
      Number(balanceWei) / 1e18;

    updateWalletDisplay(
      walletAddress,
      balanceEth
    );

  } catch (error) {
    console.error("Wallet information error:", error);
  }
}


/* =========================
   DISPLAY WALLET
========================= */

function updateWalletDisplay(address, balance) {
  const addressElements = [
    document.getElementById("walletAddress"),
    document.getElementById("wallet-address")
  ];

  addressElements.forEach(function(element) {
    if (element) {
      element.textContent = address;
    }
  });

  const balanceElements = [
    document.getElementById("walletBalance"),
    document.getElementById("wallet-balance")
  ];

  balanceElements.forEach(function(element) {
    if (element) {
      element.textContent =
        Number(balance).toFixed(6) + " native token";
    }
  });
}


/* =========================
   SEND CRYPTO
========================= */

async function sendCrypto() {
  if (!window.ethereum) {
    alert("Please connect a compatible crypto wallet first.");
    return;
  }

  if (!walletAddress) {
    await connectWallet();

    if (!walletAddress) {
      return;
    }
  }

  const recipientElement =
    document.getElementById("recipient");

  const amountElement =
    document.getElementById("amount");

  if (!recipientElement || !amountElement) {
    alert(
      "The send form is not installed on the page yet."
    );
    return;
  }

  const recipient =
    recipientElement.value.trim();

  const amount =
    amountElement.value.trim();

  if (!recipient) {
    alert("Enter a recipient wallet address.");
    return;
  }

  if (!amount || Number(amount) <= 0) {
    alert("Enter a valid amount.");
    return;
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
    alert(
      "Invalid Ethereum-compatible wallet address."
    );
    return;
  }

  if (!confirm(
    "You are about to send " +
    amount +
    " native tokens to:\n\n" +
    recipient +
    "\n\nContinue?"
  )) {
    return;
  }

  try {
    const valueWei =
      "0x" +
      BigInt(
        Math.floor(Number(amount) * 1e18)
      ).toString(16);

    const transactionHash =
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: recipient,
            value: valueWei
          }
        ]
      });

    alert(
      "Transaction submitted!\n\n" +
      "Transaction hash:\n" +
      transactionHash
    );

    await updateWalletInfo();

  } catch (error) {
    console.error(error);

    alert(
      "Transaction was rejected or failed."
    );
  }
}


/* =========================
   RECEIVE CRYPTO
========================= */

function receiveCrypto() {
  if (!walletAddress) {
    alert(
      "Connect your wallet first so we can display your receiving address."
    );
    return;
  }

  alert(
    "Your receiving address is:\n\n" +
    walletAddress
  );
}


/* =========================
   MINING
========================= */

function showMining() {
  const mining =
    document.getElementById("mining");

  if (mining) {
    mining.scrollIntoView({
      behavior: "smooth"
    });
  }
}


/*
  IMPORTANT:

  This website does NOT pretend to mine
  Bitcoin using the visitor's phone/browser.

  Real Bitcoin mining requires specialized
  mining hardware and a Bitcoin network setup.

  We can add a legitimate mining dashboard later
  that displays real mining-pool information.
*/


/* =========================
   FORMAT ADDRESS
========================= */

function formatAddress(address) {
  if (!address) {
    return "";
  }

  return (
    address.substring(0, 6) +
    "..." +
    address.substring(address.length - 4)
  );
}


/* =========================
   WALLET EVENTS
========================= */

if (window.ethereum) {

  window.ethereum.on(
    "accountsChanged",
    function(accounts) {

      walletAddress =
        accounts.length
          ? accounts[0]
          : null;

      if (walletAddress) {
        updateWalletInfo();
      }
    }
  );

  window.ethereum.on(
    "chainChanged",
    function() {
      window.location.reload();
    }
  );
}

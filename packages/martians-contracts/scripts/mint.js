const martians = {
  init: function martians_init() {
    this.elemToken = document.querySelector("#token");
    this.elemBalance = document.querySelector("#balance");
    this.elemConnect = document.querySelector("#connect");
    this.elemMintear = document.querySelector("#mintear");

    this.premintPrice = parseFloat(0.00003);
    this.regularPrice = parseFloat(0.00006);
    this.premintSupply = 747;
    this.regularSupply = 4000;
    this.limitToMint = 4;
    this.totalMinted = 746;

    this.balanceAccount = 0;
    this.quantityToMint = 0;
    this.isConnected = false;
    this.isOwner = false;
    this.provider = null;
    this.signer = null;

    this.elemConnect.addEventListener("click", martians.connect);
    this.elemMintear.setAttribute("disabled", true);
  },

  connect: async function martians_connect() {
    let self = martians;
    const { ethereum } = window;

    self.provider = new ethers.providers.Web3Provider(ethereum);
    self.signer = self.provider.getSigner();

    if (ethereum.isMetaMask) {
      const accounts = await self.provider.send("eth_requestAccounts", []);

      if (accounts.length) {
        self.elemConnect.innerHTML = accounts[0].substring(0, 10);
        self.isConnected = true;
        self.balanceAccount = await self.getBalanceOwner(accounts[0]);
        self.isOwner =
          accounts[0].toUpperCase() === contrato.owner.toUpperCase();

        self.elemMintear.innerHTML = "Mint";
        self.elemBalance.innerHTML = `Balance: ${parseInt(
          self.balanceAccount
        )} tokens`;

        self.disableQuantity();

        if (
          (self.isOwner || self.balanceAccount < self.limitToMint) &&
          self.balanceAccount > -1
        )
          martians.enableQuantity();
      }
    } else {
      alert("Install MetaMask, plase.");
    }
  },

  disableQuantity: function martians_enableQuantity() {
    const nodeQuantity = document.querySelectorAll(".quantity");

    nodeQuantity.forEach((element) => {
      element.removeEventListener("click", martians.setQuantityMint);
      element.setAttribute("disabled", true);
      element.classList.add("bg-transparent", "text-muted");
      element.classList.remove("bg-primary", "text-white");
    });

    this.elemMintear.removeEventListener("click", martians.mintToken);
    this.elemMintear.setAttribute("disabled", true);
  },

  enableQuantity: function martians_enableQuantity() {
    const self = martians;
    const nodeQuantity = document.querySelectorAll(".quantity");
    const availableToMint = self.limitToMint - self.balanceAccount;

    if (self.isOwner) {
      nodeQuantity.forEach((element) => {
        element.addEventListener("click", martians.setQuantityMint);
        element.removeAttribute("disabled");
      });
    } else {
      Array.from(nodeQuantity)
        .filter((elemento) => elemento.id <= availableToMint)
        .map(function (element) {
          element.addEventListener("click", martians.setQuantityMint);
          element.removeAttribute("disabled");
        });
    }
  },

  setQuantityMint: function martians_setQuantityMint() {
    const self = martians;
    const nodeQuantity = document.querySelectorAll(".quantity");
    self.quantityToMint = this.id;

    nodeQuantity.forEach((element) => {
      element.classList.add("bg-transparent");
      element.classList.remove("bg-primary", "text-white");
    });

    this.classList.add("bg-primary", "text-white");
    this.classList.remove("bg-transparent");

    if (self.quantityToMint > 0) {
      self.elemMintear.addEventListener("click", martians.mintToken);
      self.elemMintear.removeAttribute("disabled");
    }
  },

  mintToken: async function martians_mintToken() {
    const self = martians;

    self.disableQuantity();
    self.elemMintear.innerHTML = "Minting...";

    const totalSupply = await self.getTotalMinted();
    const totalToMint = parseInt(self.quantityToMint) + parseInt(totalSupply);
    let valueEther = 0;

    if (totalSupply < self.premintSupply && totalToMint > self.premintSupply) {
      const quantityPremintToMint =
        (self.premintSupply - totalSupply) * self.premintPrice;
      const quantityRegularToMint =
        (totalToMint - self.premintSupply) * self.regularPrice;

      valueEther = quantityPremintToMint + quantityRegularToMint;

      console.log("Token premint: " + quantityPremintToMint);
      console.log("Token regular: " + quantityRegularToMint);
    } else
      valueEther =
        totalSupply < self.premintSupply
          ? self.premintPrice * self.quantityToMint
          : self.regularPrice * self.quantityToMint;

    console.log("Value: " + valueEther.toFixed(6));

    const contract_martians = new ethers.Contract(
      contrato.address,
      contrato.abi,
      self.signer
    );

    try {
      const tx = await contract_martians.mint(self.quantityToMint, {
        value: self.isOwner
          ? 0
          : ethers.utils.parseEther(valueEther.toFixed(6).toString()),
        gasLimit: 3000000,
      });

      await tx.wait().then((receipt) => {
        self.popupConfirmation(true, receipt.transactionHash);
      });
    } catch (err) {
      self.popupConfirmation(false, null);
    } finally {
      self.connect();
    }
  },

  getTotalMinted: async function martians_getTotalMinted() {
    const self = martians;
    let result = -1;

    const contract_martians = new ethers.Contract(
      contrato.address,
      contrato.abi,
      self.signer
    );

    try {
      result = await contract_martians.totalSupply();
    } catch (err) {
      self.popupConfirmation(false, null);
    } finally {
      return parseInt(result);
    }
  },

  getBalanceOwner: async function martians_getBalanceOwner(account) {
    const self = martians;
    let result = -1;

    const contract_martians = new ethers.Contract(
      contrato.address,
      contrato.abi,
      self.signer
    );

    try {
      result = await contract_martians.balanceOf(account);
    } catch (err) {
      self.popupConfirmation(false, null);
    } finally {
      return parseInt(result);
    }
  },

  popupConfirmation: async function martians_popupConfirmation(status, hash) {
    Swal.fire({
      icon: status ? "success" : "error",
      title: status
        ? "<span style='color: black'>Success</span>"
        : "<span style='color: black'>Reverted</span>",
      html: status
        ? `<span style='font-size:14px'>Transaction completed.</span><br><a target='_blank' href='https://goerli.etherscan.io/tx/${hash}' style='font-size:12px'>${hash}</a>`
        : `<span style='font-size:14px'>Transaction has been reverted by the EVM.</span>`,
    }).then(() => {
      connect();
    });
  },
};

window.onload = async (e) => {
  martians.init();
};

window.ethereum.on("accountsChanged", function (accounts) {
  martians.connect();
});

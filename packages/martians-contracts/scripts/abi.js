const contrato = {
  address: "0x90aca957093c82a0FE5366211d966C22E4dc7AD3",
  owner: "0x6E6752e757282f5907E9898804a716bcD8373b4a",
  abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
      ],
      name: "mint",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};

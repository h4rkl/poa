/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/poa.json`.
 */
export type Poa = {
  "address": "attniPrPU1JUizLdPwgjXwSB5WGp5FHKziSpZQvwfoV",
  "metadata": {
    "name": "poa",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Launch and mine meme tokens on Solana"
  },
  "instructions": [
    {
      "name": "attentionInteract",
      "discriminator": [
        174,
        238,
        99,
        38,
        128,
        139,
        126,
        204
      ],
      "accounts": [
        {
          "name": "tokenPoolAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "attentionAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "proofAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  111,
                  102,
                  95,
                  97,
                  99,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "attentionAuthority"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "tokenPoolAcc",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenPoolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "tokenPoolAcc"
              }
            ]
          }
        },
        {
          "name": "feeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenPoolAcc"
              }
            ]
          }
        },
        {
          "name": "rewardVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "attentionAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poaFees",
          "writable": true
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "attentionInteractionArgs"
            }
          }
        }
      ]
    },
    {
      "name": "feeVaultWithdrawFunds",
      "discriminator": [
        226,
        211,
        147,
        63,
        231,
        112,
        56,
        214
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "args.token_name"
              }
            ]
          }
        },
        {
          "name": "tokenPoolAcc",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "feeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenPoolAcc"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "feeVaultWithdrawArgs"
            }
          }
        }
      ]
    },
    {
      "name": "tokenPoolInitialise",
      "discriminator": [
        253,
        132,
        132,
        255,
        204,
        109,
        7,
        255
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "args.token_name"
              }
            ]
          }
        },
        {
          "name": "metadataAccount",
          "writable": true
        },
        {
          "name": "tokenPoolAcc",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenPoolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "tokenPoolAcc"
              }
            ]
          }
        },
        {
          "name": "feeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenPoolAcc"
              }
            ]
          }
        },
        {
          "name": "poaFees",
          "writable": true
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "tokenPoolInitArgs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "feeVault",
      "discriminator": [
        192,
        178,
        69,
        232,
        58,
        149,
        157,
        132
      ]
    },
    {
      "name": "proofAcc",
      "discriminator": [
        38,
        127,
        65,
        80,
        78,
        110,
        29,
        41
      ]
    },
    {
      "name": "tokenPoolAcc",
      "discriminator": [
        180,
        83,
        166,
        251,
        136,
        98,
        11,
        252
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTokenPoolAccount",
      "msg": "Invalid pool token account."
    },
    {
      "code": 6001,
      "name": "invalidPoolAddress",
      "msg": "Invalid pool address."
    },
    {
      "code": 6002,
      "name": "cooldownNotMet",
      "msg": "Cooldown not met."
    },
    {
      "code": 6003,
      "name": "invalidHash",
      "msg": "Invalid hash provided."
    },
    {
      "code": 6004,
      "name": "invalidPoaAcc",
      "msg": "Invalid POA fee acc."
    },
    {
      "code": 6005,
      "name": "withdrawNotApproved",
      "msg": "Withdraw not approved."
    },
    {
      "code": 6006,
      "name": "insufficientFeeVaultBalance",
      "msg": "Insufficient fee vault balance."
    },
    {
      "code": 6007,
      "name": "stringTooLong",
      "msg": "Input string too long."
    }
  ],
  "types": [
    {
      "name": "attentionInteractionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenName",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "feeVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenPoolAcc",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "feeVaultWithdrawArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenName",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "proofAcc",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "challenge",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "lastHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "lastProofAt",
            "type": "i64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenRewardVault",
            "type": "pubkey"
          },
          {
            "name": "totalRewards",
            "type": "u64"
          },
          {
            "name": "totalProofs",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenPoolAcc",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "tokenName",
            "type": "string"
          },
          {
            "name": "mintAddress",
            "type": "pubkey"
          },
          {
            "name": "poolFeeVault",
            "type": "pubkey"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "poolFee",
            "type": "u64"
          },
          {
            "name": "timeoutSec",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "tokenPoolInitArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolFee",
            "type": "u64"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "timeoutSec",
            "type": "u32"
          },
          {
            "name": "tokenDecimals",
            "type": "u8"
          },
          {
            "name": "tokenName",
            "type": "string"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    }
  ]
};

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/memeoor.json`.
 */
export type Memeoor = {
  "address": "memev6gnPZhMteK2mQ2GXpHv6ZNtCFJsbzbhG3A3T1m",
  "metadata": {
    "name": "memeoor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Launch and mine meme tokens on Solana"
  },
  "instructions": [
    {
      "name": "claimTokens",
      "discriminator": [
        108,
        216,
        210,
        231,
        0,
        212,
        42,
        64
      ],
      "accounts": [
        {
          "name": "poolAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  101,
                  111,
                  111,
                  114,
                  95,
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "poolAuthority"
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  101,
                  111,
                  111,
                  114,
                  95,
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "userClaim",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "poolAuthority"
              },
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  101,
                  111,
                  111,
                  114,
                  95,
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeToken",
      "discriminator": [
        38,
        209,
        150,
        50,
        190,
        117,
        16,
        54
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenPoolAcc",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  101,
                  111,
                  111,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenPoolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenPoolAcc"
              },
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  101,
                  111,
                  111,
                  114,
                  95,
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
                "kind": "account",
                "path": "tokenPoolAcc"
              },
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  101,
                  111,
                  111,
                  114,
                  95,
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
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
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
              "name": "initializeTokenPoolArgs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "airdropPool",
      "discriminator": [
        196,
        25,
        1,
        13,
        71,
        9,
        85,
        148
      ]
    },
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
    },
    {
      "name": "userClaim",
      "discriminator": [
        228,
        142,
        195,
        181,
        228,
        147,
        32,
        209
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
      "name": "alreadyClaimed",
      "msg": "User has already claimed their tokens."
    },
    {
      "code": 6003,
      "name": "invalidAmount",
      "msg": "Invalid amount."
    }
  ],
  "types": [
    {
      "name": "airdropPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
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
            "name": "totalFeesCollected",
            "type": "u64"
          },
          {
            "name": "tokenPoolVault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "initializeTokenPoolArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialCost",
            "type": "u64"
          },
          {
            "name": "stepInterval",
            "type": "u64"
          },
          {
            "name": "stepFactor",
            "type": "u64"
          },
          {
            "name": "totalSupply",
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
            "name": "mintAddress",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "initialCost",
            "type": "u64"
          },
          {
            "name": "stepInterval",
            "type": "u64"
          },
          {
            "name": "stepFactor",
            "type": "u64"
          },
          {
            "name": "maxPoolCost",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "minedTokens",
            "type": "u64"
          },
          {
            "name": "poolFeeVault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "userClaim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "hasClaimed",
            "type": "bool"
          }
        ]
      }
    }
  ]
};

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
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
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
              },
              {
                "kind": "account",
                "path": "tokenPoolAcc"
              }
            ]
          }
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
              "name": "initializeTokenPoolArgs"
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
    }
  ],
  "types": [
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
      "name": "initializeTokenPoolArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialCost",
            "type": "u64"
          },
          {
            "name": "stepFactor",
            "type": "u64"
          },
          {
            "name": "stepInterval",
            "type": "u64"
          },
          {
            "name": "symbol",
            "type": "string"
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
            "name": "mintAddress",
            "type": "pubkey"
          },
          {
            "name": "poolFeeVault",
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
          }
        ]
      }
    }
  ]
};

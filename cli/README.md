solana airdrop 2 oWN1o6G79qLrEEK4JB67GYsRNUhAoQRfAYnKJTxbrpe --url http://localhost:8899

pnpm dev create_token --keypair ~/.config/solana/id.json --description "A token for attention" --connection http://localhost:8899 --amount 1000000 --decimals 5 --image ../public/attn.png --name "Holy" --symbol "HOLY"

pnpm dev init --keypair ~/.config/solana/id.json --connection http://localhost:8899 --pool-fee 0.001 --timeout 7 --supply 100000 --reward 1 --decimals 5 --name "Holy" --mint "9UWUJ9iXufNT4cZ5E7HZWRTcEAN3y9nF5G7Li3KELct5"

pnpm dev interact --connection http://localhost:8899 --user-keypair ~/.config/solana/id.json --pool-keypair ~/.config/solana/id.json --name "Holy" --mint "9UWUJ9iXufNT4cZ5E7HZWRTcEAN3y9nF5G7Li3KELct5"

pnpm dev init --keypair ~/.config/solana/id.json --image ../public/attn.png --description "A token for attention" --connection https://api.devnet.solana.com --pool-fee 0.001 --timeout 7 --supply 100000 --reward 1 --decimals 5 --symbol "CLICK" --name "ClickTest"
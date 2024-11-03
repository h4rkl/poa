solana airdrop 2 oWN1o6G79qLrEEK4JB67GYsRNUhAoQRfAYnKJTxbrpe --url http://localhost:8899

pnpm dev init --keypair ~/.config/solana/id.json --image ../public/attn.png --description "A token for attention" --connection http://localhost:8899 --pool-fee 0.001 --timeout 7 --supply 100000 --reward 1 --decimals 5 --symbol "TEST" --name "Holy"

pnpm dev interact --connection http://localhost:8899 --user-keypair ~/.config/solana/id.json --pool-keypair ~/.config/solana/id.json --name "Holy"

pnpm dev init --keypair ~/.config/solana/id.json --image ../public/attn.png --description "A token for attention" --connection https://api.devnet.solana.com --pool-fee 0.001 --timeout 7 --supply 100000 --reward 1 --decimals 5 --symbol "CLICK" --name "ClickTest"
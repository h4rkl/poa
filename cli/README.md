pnpm dev init --keypair ~/.config/solana/id.json --image ../public/attn.png --name "Holy" --symbol "HAM" --description "A token for attention" --connection http://localhost:8899 --timeout 7 --supply 100000 --reward 1 --decimals 5

pnpm dev interact --connection http://localhost:8899 --user-keypair ~/.config/solana/id.json --pool-keypair ~/.config/solana/id.json --name "Holy"
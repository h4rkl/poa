## Testnet commands

solana airdrop 2 oWN1o6G79qLrEEK4JB67GYsRNUhAoQRfAYnKJTxbrpe --url http://localhost:8899

pnpm cmdr create_token --keypair ~/.config/solana/id.json --description "A token for attention" --connection http://localhost:8899 --amount 1000000 --decimals 5 --image ../public/attn.png --name "Holy" --symbol "HOLY"

pnpm cmdr init --keypair ~/.config/solana/id.json --connection http://localhost:8899 --pool-fee 0.001 --timeout 7 --supply 100000 --reward 1 --decimals 5 --name "Holy" --mint "9UWUJ9iXufNT4cZ5E7HZWRTcEAN3y9nF5G7Li3KELct5"

pnpm cmdr interact --connection http://localhost:8899 --user-keypair ~/.config/solana/id.json --pool-keypair ~/.config/solana/id.json --name "Holy" --mint "9UWUJ9iXufNT4cZ5E7HZWRTcEAN3y9nF5G7Li3KELct5"

## Devnet commands

arloader upload '/Users/bowie/SitesC/poa/public/metadata.json' --ar-keypair-path '/Users/bowie/SitesC/poa/.archive/arweave'

pnpm cmdr create_token --keypair /Users/bowie/SitesC/poa/.archive/signrMdZBa1kLBMSi3Bwv4c6xT6GuThtwW4sVNJKSRv.json --description "A token for attention" --connection "https://api.devnet.solana.com" --amount 100000 --decimals 5 --image ../public/attn.png --name "Click" --symbol "CLICK" --metadataUri "https://arweave.net/l2pbSXx3CuCWSKjyx7kJsnDgVdhf8jitUCnAzMJfr_c"

pnpm cmdr init --keypair /Users/bowie/SitesC/poa/.archive/signrMdZBa1kLBMSi3Bwv4c6xT6GuThtwW4sVNJKSRv.json --connection "https://api.devnet.solana.com" --pool-fee 0.001 --timeout 7 --supply 100000 --reward 1 --decimals 5 --name Click --mint GJEgHchP5i56FEG6q5cEPyWw9ehArTGXfGnC17556Mcq

pnpm cmdr withdraw-fees --keypair /Users/bowie/SitesC/poa/.archive/signrMdZBa1kLBMSi3Bwv4c6xT6GuThtwW4sVNJKSRv.json --connection "https://api.devnet.solana.com" --name Click --mint GJEgHchP5i56FEG6q5cEPyWw9ehArTGXfGnC17556Mcq --amount 0.00916928

pnpm cmdr withdraw-fees --keypair ~/.config/solana/id.json --connection "https://api.mainnet-beta.solana.com" --name Click --mint 7KBaynnEyvEbernyc2CMDMoUh5edF3Sgw8qKELt3jtD --amount 26.23217028

pnpm cmdr withdraw-fees --keypair /Users/bowie/SitesC/poa/.archive/signrMdZBa1kLBMSi3Bwv4c6xT6GuThtwW4sVNJKSRv.json --connection "https://api.mainnet-beta.solana.com" --name Click --mint 7KBaynnEyvEbernyc2CMDMoUh5edF3Sgw8qKELt3jtD --amount 26.23217028
#!/bin/bash

# Create a temporary file for the keypair
KEYPAIR_FILE="./recovered_buffer_keypair.json"
SEED_PHRASE="unveil soft mixed ill federal slim dolphin someone hero develop spice hobby"

# Use heredoc to handle the interactive prompts
expect << EOF
spawn solana-keygen recover -o $KEYPAIR_FILE
expect "\[recover\] seed phrase: "
send "$SEED_PHRASE\r"
expect "\[recover\] If this seed phrase has an associated passphrase, enter it now. Otherwise, press ENTER to continue: "
send "\r"
expect "Continue?"
send "y\r"
expect eof
EOF

# Verify the keypair file exists
if [ ! -f "$KEYPAIR_FILE" ]; then
    echo "Error: Failed to create keypair file"
    exit 1
fi

echo "Successfully recovered keypair to $KEYPAIR_FILE"

# Get the recovered public key
RECOVERED_ADDRESS=$(solana-keygen pubkey "$KEYPAIR_FILE")
echo "Recovered address: $RECOVERED_ADDRESS"

# Close the buffer account and recover the SOL to the specified address
solana program close \
    "$KEYPAIR_FILE" \
    --recipient harkLSUe2Puud2TVQUhHW4vs45mF1YMLU3PThPCuWd8 \
    --bypass-warning

# Clean up the temporary keypair file
rm -f "$KEYPAIR_FILE"
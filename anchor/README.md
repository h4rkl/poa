# anchor

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build anchor` to build the library.

## Running unit tests

Run `nx test anchor` to execute the unit tests via [Jest](https://jestjs.io).

### Use metaplex in local

Dump the file from mainnet locally:

`solana program dump -u m metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s .anchor/metaplex.so`

Then Load using:

`solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s .anchor/metaplex.so`
`solana-test-validator -r --deactivate-feature EenyoWx9UMXYKpR8mW5Jmfmy2fRjzUtM7NduYMY8bx33`
`solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s .anchor/metaplex.so --deactivate-feature EenyoWx9UMXYKpR8mW5Jmfmy2fRjzUtM7NduYMY8bx33`

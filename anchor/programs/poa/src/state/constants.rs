pub const MINT_SEED: &[u8] = b"mint";
pub const CONFIG_SEED: &[u8] = b"config";
pub const TOKEN_VAULT_SEED: &[u8] = b"token_vault";
pub const FEE_VAULT_SEED: &[u8] = b"fee_vault";
pub const PROOF_ACC_SEED: &[u8] = b"proof_acc";
pub const TIME_DIFFICULTY_ADJUSTMENT: u32 = 600; // 10 minutes in seconds
pub const STARTING_DIFFICULTY: u64 = 18_014_398_509_481_984;

pub const BASE_FEE: u64 = 1_500_000; // 0.0015 SOL in lamports
pub const TX_FEE: u64 = 150_000; // 0.00015 SOL in lamports
pub const POA_FEE_ACC: &str = "CLiCKaKS3DZUCr9WazTnXSM1Tky7kgrKy6tDQ2tSeZ9P";
pub const MAX_NAME_LENGTH: usize = 32;
pub const MAX_SYMBOL_LENGTH: usize = 10;
pub const MAX_URI_LENGTH: usize = 1000;
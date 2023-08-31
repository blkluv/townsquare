type TokenType = {
  tokenName: string
  mintAddress: string
  decimals: number
  tokenImage: string
}

export const BONK: TokenType = {
  tokenName: 'BONK',
  mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  decimals: 5,
  tokenImage:
    'https://pbs.twimg.com/profile_images/1600956334635098141/ZSzYTrHf_400x400.jpg',
}

export const GUAC: TokenType = {
  tokenName: 'GUAC',
  mintAddress: 'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR',
  decimals: 5,
  tokenImage:
    'https://shdw-drive.genesysgo.net/36JhGq9Aa1hBK6aDYM4NyFjR5Waiu9oHrb44j1j8edUt/image.png',
}

export const BSOL: TokenType = {
  tokenName: 'BSOL',
  mintAddress: 'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1',
  decimals: 9,
  tokenImage:
    'https://images.xnfts.dev/cdn-cgi/image/fit=crop,width=400,height=400,quality=85/https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1/logo.png',
}

export const BLAZE: TokenType = {
  tokenName: 'BLAZE',
  mintAddress: 'BLZEEuZUBVqFhj8adcCFPJvPVCiCyVmh3hkJMrU8KuJA',
  decimals: 9,
  tokenImage:
    'https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fsolblaze.org%2Fassets%2Fblze.png&fit=cover&width=256&height=256g',
}

export const SOL: TokenType = {
  tokenName: 'SOL',
  mintAddress: '',
  decimals: 9,
  tokenImage:
    'https://seeklogo.com/images/S/solana-sol-logo-12828AD23D-seeklogo.com.png',
}

export const TipTokens = {
  SOL,
  BONK,
  GUAC,
  BLAZE,
}

export function searchTokenByName(tokenName: string): TokenType | undefined {
  return Object.values(TipTokens).find(token => token.tokenName === tokenName)
}

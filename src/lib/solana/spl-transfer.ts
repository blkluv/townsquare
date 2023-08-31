import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'

import {searchTokenByName} from '../tipTokens'

export async function getOrCreateTokenAccountInstruction(
  mint: PublicKey,
  user: PublicKey,
  connection: Connection,
  payer: PublicKey | null = null,
): Promise<TransactionInstruction | string> {
  const userTokenAccountAddress = await getAssociatedTokenAddress(
    mint,
    user,
    false,
  )
  const userTokenAccount = await connection.getParsedAccountInfo(
    userTokenAccountAddress,
  )

  if (userTokenAccount.value === null) {
    return createAssociatedTokenAccountInstruction(
      payer ? payer : user,
      userTokenAccountAddress,
      user,
      mint,
    )
  } else {
    return userTokenAccountAddress.toString()
  }
}

type splTransferIxParams = {
  amount: string
  tokenName: string
  sender: string
  receiver: string
  connection: Connection
}

export async function splTransferIx({
  amount,
  tokenName,
  receiver,
  sender,
  connection,
}: splTransferIxParams): Promise<TransactionInstruction[]> {
  const token = searchTokenByName(tokenName)
  if (!token) {
    throw new Error('Token not found')
  }
  const mint = new PublicKey(token.mintAddress)
  const senderPubkey = new PublicKey(sender)
  const receiverPubkey = new PublicKey(receiver)

  const ixs: TransactionInstruction[] = []

  const senderATA = await getAssociatedTokenAddress(mint, senderPubkey)

  const recieverATA = await getAssociatedTokenAddress(mint, receiverPubkey)

  const recipientATAOrIx = await getOrCreateTokenAccountInstruction(
    mint,
    receiverPubkey,
    connection,
    senderPubkey,
  )

  if (recipientATAOrIx instanceof TransactionInstruction) {
    ixs.push(recipientATAOrIx)
  }

  const transferIx = createTransferCheckedInstruction(
    senderATA,
    mint,
    recieverATA,
    senderPubkey,
    parseFloat(amount) * 10 ** token.decimals,
    token.decimals,
  )
  ixs.push(transferIx)

  return ixs
}

type solTransferIxParams = {
  amount: string
  sender: string
  receiver: string
}

export function solTransferIx({
  amount,
  sender,
  receiver,
}: solTransferIxParams): TransactionInstruction {
  const senderPubkey = new PublicKey(sender)
  const receiverPubkey = new PublicKey(receiver)
  const ix = SystemProgram.transfer({
    fromPubkey: senderPubkey,
    toPubkey: receiverPubkey,
    lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
  })

  return ix
}

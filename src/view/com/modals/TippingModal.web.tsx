import * as Toast from "../util/Toast";
import * as buffer from "buffer";

import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import React, { useState } from "react";
import { SOL, searchTokenByName } from "../../../lib/tipTokens";
import { StyleSheet, TextInput, View } from "react-native";
import { solTransferIx, splTransferIx } from "../../../lib/solana/spl-transfer";

import { Button } from "../util/forms/Button";
import { CenteredView } from "../util/Views";
import { HELIUS_RPC_API } from "../../../lib/constants";
import { Image } from "expo-image";
import { Text } from "../util/text/Text";
import { TippingModal } from "../../../state/models/ui/shell";
import { observer } from "mobx-react-lite";
import { s } from "../../../lib/styles";
import { useAnalytics } from "../../../lib/analytics/analytics";
import { usePalette } from "../../../lib/hooks/usePalette";
import { useSplxWallet } from "../wallet/useSplxWallet";
import { useStores } from "../../../state/index";
import { useTheme } from "../../../lib/ThemeContext";
import { useWallet } from "@solana/wallet-adapter-react";

window.Buffer = buffer.Buffer;


type TipBtnProps = {
  label: string
  disabled: boolean,
  onPress: () => void
}

function TipBtn({label,disabled,onPress}:TipBtnProps) {
  return (
    <Button
    disabled={disabled}
    style={{ width: 255, alignItems: "center" }}
    type="primary-outline"
    onPress={() => {
      onPress()
    }}
  >
    {label}
  </Button>
  )
}


type ConnectWalletModalProps = {
  recipientName: string;
}

function ConnectWalletModal({recipientName}:ConnectWalletModalProps) {
  const pal = usePalette("default");
  const [
    visible,
    setVisible,
    linkedWallet,
    connectedWallet,
    connectWalletIsBusy,
    disconnectWalletIsBusy,
  ] = useSplxWallet();

  async function handleConnectWallet() {
    setVisible(true);
  }
  return (
    <CenteredView style={[pal.view, styles.center]}>
    <View style={{ paddingVertical: 10 }}>
      <Text type="2xl-bold">
        Connect Your Wallet to Tip {recipientName}
      </Text>
    </View>
    <TipBtn disabled={connectWalletIsBusy} onPress={() => {
        handleConnectWallet();
      }} label="Connect Wallet"   />
  </CenteredView>
  )
}


export const Component = observer(
  function({
    recipientName,
    tokenName,
    recipientAddress,
  }: TippingModal) {
    const store = useStores();
    const pal = usePalette("default");
    const token = searchTokenByName(tokenName);
    const theme = useTheme();
    const [tipUIAmount, setTipUIAmount] = useState<string>("");
    const wallet = useWallet();

    const [
      visible,
      setVisible,
      linkedWallet,
      connectedWallet,
      connectWalletIsBusy,
      disconnectWalletIsBusy,
    ] = useSplxWallet();
    const { track } = useAnalytics();
    const [sig, setSig] = useState();


    async function handleTipTranfer(
      senderAddress: string,
      recipientAddress: string,
      amount: string,
   
    ) {
      const senderPubkey = new PublicKey(senderAddress);
      if (
        !store.me.splxWallet ||
        !wallet.signTransaction ||
        !wallet.connected
      ) {
        Toast.show("Please make sure to connect your wallet");
        return;
      }

      const tx = new Transaction();
      const connection = new Connection(
        `${HELIUS_RPC_API}/?api-key=${process.env.HELIUS_API_KEY}`,
      );
      try {
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;
        tx.feePayer = senderPubkey;

        if (tokenName !== SOL.tokenName ) {
          const ixs = await splTransferIx(
           {
            amount,
            tokenName,
            receiver: recipientAddress,
            sender: senderAddress,
            connection
           }
          )
          
          tx.add(...ixs);
        } else {
          const ix = solTransferIx({
            amount,
            receiver: recipientAddress,
            sender: senderAddress,

          })

          tx.add(ix);
        }
        const signedTx = await wallet.signTransaction(tx);
        const sig = await connection.sendRawTransaction(signedTx.serialize());
        track("Tip:TipConfirmation",{
          token: tokenName,
          sender: senderAddress,
          reciever: recipientAddress,
          amount: amount
        });
        Toast.show("Tip Sent");
        store.shell.closeModal();
      } catch (error) {
        Toast.show("Something Went Wrong");
        console.error("Something Went Wrong", error);
      }
    }


    return (
      <View style={[s.flex1, pal.view, styles.container]}>
        {connectedWallet !== "" ? (
          <CenteredView style={[pal.view, styles.center]}>
            <View style={{ paddingVertical: 10 }}>
              <Text type="2xl-bold">
                Tip {recipientName} with {tokenName} and support their work
              </Text>
            </View>
            <View style={[pal.borderDark, styles.inputContainer]}>
              <View style={{ paddingRight: 10 }}>
                <Image
                  source={{
                    uri: token?.tokenImage,
                  }}
                  style={[styles.image]}
                />
              </View>
              <TextInput
                style={[pal.text, styles.textInput]}
                placeholderTextColor={pal.colors.textLight}
                placeholder="0.00"
                keyboardAppearance={theme.colorScheme}
                keyboardType="decimal-pad"
                value={tipUIAmount}
                onChangeText={(text) => {
                  const formattedText = text.replace(/[^0-9.]/g, "");
                  setTipUIAmount(formattedText);
                }}
              />
            </View>
            <View style={{ paddingVertical: 10 }}>
              <TipBtn label={`Tip ${recipientName}`} disabled={parseFloat(tipUIAmount) == 0} onPress={() => {
                  {
                    handleTipTranfer(
                      connectedWallet,
                      recipientAddress,
                      tipUIAmount,
        
                    );
                  }
                }} />
            </View>
          </CenteredView>
        ) : (
           <ConnectWalletModal recipientName={recipientName} />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 5,
    width: "full",
  },
  image: {
    width: 30,
    height: 30,
    paddingRight: 2,
  },
  tipAmountContainer: {
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  container: {
    paddingHorizontal: 1,
  },
  center: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    marginTop: 2,
    flex: 1,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 17,
    letterSpacing: 0.25,
    fontWeight: "400",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: s.gray3.color,
  },
});

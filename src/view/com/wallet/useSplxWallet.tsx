import * as Toast from "../util/Toast";

import { useEffect } from 'react';
import { useStores } from '../../../state';
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export const useSplxWallet = () => {
  const store = useStores();
  const wallet = useWallet();
  const waitForWalletConnectIsBusy = store.wallet.waitForWalletConnectIsBusy();
  const waitingToConnectWallet = store.wallet.state.waitingToConnectWallet;
  const waitingToConnectWalletCanceled = store.wallet.state.canceledWaitingToConnectWallet;
  const walletAddressFromWalletConnect = wallet.publicKey?.toBase58() ?? '';
  const walletAddressFromModel = store.wallet.state.walletId;
  const linkedWallet = store.wallet.connectedWallet;
  const linkWalletIsBusy = walletAddressFromWalletConnect && store.wallet.linkWalletIsBusy(walletAddressFromWalletConnect);
  const unlinkWalletIsBusy = store.wallet.unlinkWalletIsBusy();
  const connectWalletIsBusy = waitingToConnectWallet || linkWalletIsBusy;
  const disconnectWalletIsBusy = unlinkWalletIsBusy || wallet.disconnecting;

  const { setVisible, visible } = useWalletModal();

  function openWalletConnectDialog (b: boolean) {
    if (b === true) {
      void store.wallet.waitForWalletConnect();
    } else if (b === false) {
      setVisible(false);
    }
  }

  const disconnectWallet = async () => {
    await Promise.all([store.wallet.unlinkWallet(), wallet.disconnect()]);
    Toast.show("Wallet Disconnected");
  };

  useEffect(() => {
    if (!visible && waitForWalletConnectIsBusy && !waitingToConnectWallet && !waitingToConnectWalletCanceled) {
      setVisible(true);
    } else if (visible && waitForWalletConnectIsBusy && !waitingToConnectWallet && !waitingToConnectWalletCanceled) {
      void store.wallet.startWaitForWalletConnect();
    } else if (
      !visible &&
      !wallet.connecting &&
      waitForWalletConnectIsBusy &&
      waitingToConnectWallet &&
      !waitingToConnectWalletCanceled
    ) {
      store.wallet.cancelWaitForWalletConnect();
    }
  }, [waitForWalletConnectIsBusy, waitingToConnectWallet, visible, waitingToConnectWalletCanceled, wallet.connecting]);

  useEffect(() => {
    if (disconnectWalletIsBusy) {
      return;
    }
    if (walletAddressFromModel !== walletAddressFromWalletConnect) {
      store.wallet.setWalletAddress(walletAddressFromWalletConnect);
    }
    if (walletAddressFromWalletConnect !== walletAddressFromModel) {
      void store.wallet.linkWallet(walletAddressFromWalletConnect);
    }
  }, [walletAddressFromModel, walletAddressFromWalletConnect])

  return [visible, openWalletConnectDialog, linkedWallet, walletAddressFromModel, connectWalletIsBusy, disconnectWalletIsBusy, disconnectWallet] as [boolean, typeof openWalletConnectDialog, typeof linkedWallet, typeof walletAddressFromWalletConnect, boolean, boolean, typeof disconnectWallet];
};
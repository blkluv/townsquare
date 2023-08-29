import { ActivityIndicator, StyleSheet } from "react-native";

import { CenteredView } from "../util/Views";
import { LoggedOut } from "./LoggedOut";
// import {LoggedOut} from './LoggedOut'
import React from "react";
import { Text } from "../util/text/Text";
import { observer } from "mobx-react-lite";
import { usePalette } from "lib/hooks/usePalette";
import { useStores } from "state/index";

export const withAuthRequired = <P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> =>
  observer((props: P) => {
    const store = useStores();
    // either a user is resuming a session from earlier
    // or there is no session, in which case we'll wait for either
    // a default solarplex one or the logged in user's own
    if (store.session.isResumingSession) {
      return <Loading />;
    }
    if (!store.session.hasSession) {
      return <LoggedOut />
    }
    return <Component {...props} />;
  });

export function Loading() {
  const pal = usePalette("default");

  const [isTakingTooLong, setIsTakingTooLong] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setIsTakingTooLong(true), 15e3);
    return () => clearTimeout(t);
  }, [setIsTakingTooLong]);

  return (
    <CenteredView style={[styles.loading, pal.view]}>
      <ActivityIndicator size="large" />
      <Text type="2xl" style={[styles.loadingText, pal.textLight]}>
        {isTakingTooLong
          ? "This is taking too long. There may be a problem with your internet or with the service, but we're going to try a couple more times..."
          : "Connecting..."}
      </Text>
    </CenteredView>
  );
}

const styles = StyleSheet.create({
  loading: {
    height: "100%",
    alignContent: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  loadingText: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    textAlign: "center",
  },
});

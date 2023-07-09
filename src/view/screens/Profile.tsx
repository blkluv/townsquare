import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  CommonNavigatorParams,
  NativeStackScreenProps,
} from "lib/routes/types";
import {
  PostFeedLoadingPlaceholder,
  ProfileCardFeedLoadingPlaceholder,
} from "../com/util/LoadingPlaceholder";
import { ProfileUiModel, Sections } from "state/models/ui/profile";
import React, { useEffect, useState } from "react";
import { ViewSelector, ViewSelectorHandle } from "../com/util/ViewSelector";
import { colors, s } from "lib/styles";

import { CenteredView } from "../com/util/Views";
import { ComposeIcon2 } from "lib/icons";
import { CustomFeed } from "view/com/feeds/CustomFeed";
import { CustomFeedModel } from "state/models/feeds/custom-feed";
import { EmptyState } from "../com/util/EmptyState";
import { ErrorMessage } from "../com/util/error/ErrorMessage";
import { ErrorScreen } from "../com/util/error/ErrorScreen";
import { FAB } from "../com/util/fab/FAB";
import { FeedSlice } from "../com/posts/FeedSlice";
import { ListCard } from "view/com/lists/ListCard";
import { PostsFeedSliceModel } from "state/models/feeds/posts-slice";
import { ProfileHeader } from "../com/profile/ProfileHeader";
import { ScreenHider } from "view/com/util/moderation/ScreenHider";
import { Text } from "../com/util/text/Text";
import { combinedDisplayName } from "lib/strings/display-names";
import { observer } from "mobx-react-lite";
import { useAnalytics } from "lib/analytics/analytics";
import { useFocusEffect } from "@react-navigation/native";
import { useSetTitle } from "lib/hooks/useSetTitle";
import { useStores } from "state/index";
import { withAuthRequired } from "view/com/auth/withAuthRequired";

type Props = NativeStackScreenProps<CommonNavigatorParams, "Profile">;
export const ProfileScreen = withAuthRequired(
  observer(({ route }: Props) => {
    const store = useStores();
    const { screen, track } = useAnalytics();
    const viewSelectorRef = React.useRef<ViewSelectorHandle>(null);

    useEffect(() => {
      screen("Profile");
    }, [screen]);

    const [hasSetup, setHasSetup] = useState<boolean>(false);
    const uiState = React.useMemo(
      () => new ProfileUiModel(store, { user: route.params.name }),
      [route.params.name, store],
    );
    useSetTitle(combinedDisplayName(uiState.profile));

    const onSoftReset = React.useCallback(() => {
      viewSelectorRef.current?.scrollToTop();
    }, []);

    useEffect(() => {
      setHasSetup(false);
    }, [route.params.name]);

    useFocusEffect(
      React.useCallback(() => {
        const softResetSub = store.onScreenSoftReset(onSoftReset);
        let aborted = false;
        store.shell.setMinimalShellMode(false);
        const feedCleanup = uiState.feed.registerListeners();
        if (hasSetup) {
          uiState.update();
        } else {
          uiState.setup().then(() => {
            if (aborted) {
              return;
            }
            setHasSetup(true);
          });
        }
        return () => {
          aborted = true;
          feedCleanup();
          softResetSub.remove();
        };
      }, [store, onSoftReset, uiState, hasSetup]),
    );

    // events
    // =

    const onPressCompose = React.useCallback(() => {
      track("ProfileScreen:PressCompose");
      store.shell.openComposer({});
    }, [store, track]);
    const onSelectView = React.useCallback(
      (index: number) => {
        uiState.setSelectedViewIndex(index);
      },
      [uiState],
    );
    const onRefresh = React.useCallback(() => {
      uiState
        .refresh()
        .catch((err: any) =>
          store.log.error("Failed to refresh user profile", err),
        );
    }, [uiState, store]);
    const onEndReached = React.useCallback(() => {
      uiState
        .loadMore()
        .catch((err: any) =>
          store.log.error("Failed to load more entries in user profile", err),
        );
    }, [uiState, store]);
    const onPressTryAgain = React.useCallback(() => {
      uiState.setup();
    }, [uiState]);

    // rendering
    // =

    const renderHeader = React.useCallback(() => {
      if (!uiState) {
        return <View />;
      }
      return (
        <ProfileHeader
          view={uiState.profile}
          onRefreshAll={onRefresh}
          hideBackButton={route.params.hideBackButton}
        />
      );
    }, [uiState, onRefresh, route.params.hideBackButton]);
    const Footer = React.useMemo(() => {
      return uiState.showLoadingMoreFooter ? LoadingMoreFooter : undefined;
    }, [uiState.showLoadingMoreFooter]);
    const renderItem = React.useCallback(
      (item: any) => {
        // if section is lists
        if (uiState.selectedView === Sections.Lists) {
          if (item === ProfileUiModel.LOADING_ITEM) {
            return <ProfileCardFeedLoadingPlaceholder />;
          } else if (item._reactKey === "__error__") {
            return (
              <View style={s.p5}>
                <ErrorMessage
                  message={item.error}
                  onPressTryAgain={onPressTryAgain}
                />
              </View>
            );
          } else if (item === ProfileUiModel.EMPTY_ITEM) {
            return (
              <EmptyState
                testID="listsEmpty"
                icon="list-ul"
                message="No lists yet!"
                style={styles.emptyState}
              />
            );
          } else {
            return <ListCard testID={`list-${item.name}`} list={item} />;
          }
          // if section is custom algorithms
        } else if (uiState.selectedView === Sections.CustomAlgorithms) {
          if (item === ProfileUiModel.LOADING_ITEM) {
            return <ProfileCardFeedLoadingPlaceholder />;
          } else if (item._reactKey === "__error__") {
            return (
              <View style={s.p5}>
                <ErrorMessage
                  message={item.error}
                  onPressTryAgain={onPressTryAgain}
                />
              </View>
            );
          } else if (item === ProfileUiModel.EMPTY_ITEM) {
            return (
              <EmptyState
                testID="customAlgorithmsEmpty"
                icon="list-ul"
                message="No custom algorithms yet!"
                style={styles.emptyState}
              />
            );
          } else if (item instanceof CustomFeedModel) {
            return (
              <CustomFeed
                item={item}
                showSaveBtn={!store.session.isDefaultSession}
                showLikes
              />
            );
          }
          // if section is posts or posts & replies
        } else {
          if (item === ProfileUiModel.END_ITEM) {
            return <Text style={styles.endItem}>- end of feed -</Text>;
          } else if (item === ProfileUiModel.LOADING_ITEM) {
            return <PostFeedLoadingPlaceholder />;
          } else if (item._reactKey === "__error__") {
            if (uiState.feed.isBlocking) {
              return (
                <EmptyState
                  icon="ban"
                  message="Posts hidden"
                  style={styles.emptyState}
                />
              );
            }
            if (uiState.feed.isBlockedBy) {
              return (
                <EmptyState
                  icon="ban"
                  message="Posts hidden"
                  style={styles.emptyState}
                />
              );
            }
            return (
              <View style={s.p5}>
                <ErrorMessage
                  message={item.error}
                  onPressTryAgain={onPressTryAgain}
                />
              </View>
            );
          } else if (item === ProfileUiModel.EMPTY_ITEM) {
            return (
              <EmptyState
                icon={["far", "message"]}
                message="No posts yet!"
                style={styles.emptyState}
              />
            );
          } else if (item instanceof PostsFeedSliceModel) {
            return (
              <FeedSlice slice={item} ignoreMuteFor={uiState.profile.did} />
            );
          }
        }
        return <View />;
      },
      [
        onPressTryAgain,
        uiState.selectedView,
        uiState.profile.did,
        uiState.feed.isBlocking,
        uiState.feed.isBlockedBy,
        store.session.isDefaultSession,
      ],
    );

    return (
      <ScreenHider
        testID="profileView"
        style={styles.container}
        screenDescription="profile"
        moderation={uiState.profile.moderation.view}
      >
        {uiState.profile.hasError ? (
          <ErrorScreen
            testID="profileErrorScreen"
            title="Failed to load profile"
            message={uiState.profile.error}
            onPressTryAgain={onPressTryAgain}
          />
        ) : uiState.profile.hasLoaded ? (
          <ViewSelector
            ref={viewSelectorRef}
            swipeEnabled={false}
            sections={uiState.selectorItems}
            items={uiState.uiItems}
            renderHeader={renderHeader}
            renderItem={renderItem}
            ListFooterComponent={Footer}
            refreshing={uiState.isRefreshing || false}
            onSelectView={onSelectView}
            onRefresh={onRefresh}
            onEndReached={onEndReached}
          />
        ) : (
          <CenteredView>{renderHeader()}</CenteredView>
        )}
        {!store.session.isDefaultSession && (
          <FAB
            testID="composeFAB"
            onPress={onPressCompose}
            icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={s.white} />}
            accessibilityRole="button"
            accessibilityLabel="Compose post"
            accessibilityHint=""
          />
        )}
      </ScreenHider>
    );
  }),
);

function LoadingMoreFooter() {
  return (
    <View style={styles.loadingMoreFooter}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    height: "100%",
  },
  loading: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  emptyState: {
    paddingVertical: 40,
  },
  loadingMoreFooter: {
    paddingVertical: 20,
  },
  endItem: {
    paddingTop: 20,
    paddingBottom: 30,
    color: colors.gray5,
    textAlign: "center",
  },
});

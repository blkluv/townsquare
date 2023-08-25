import { StyleSheet, View, ViewStyle } from "react-native";

import React from "react";
import { StyleProp } from "react-native";
import { Text } from "../../../view/com/util/text/Text";
import { observer } from "mobx-react-lite";
import { s } from "../../../lib/styles";
import { usePalette } from "../../../lib/hooks/usePalette";
import { useStores } from "../../../state";

type ScoreCardProps = {
  handleTextStyle?: StyleProp<ViewStyle>;
};

export const ScoreCard = observer(({ handleTextStyle }: ScoreCardProps) => {
  const store = useStores();
  const did = store.session?.currentSession?.did ?? "";
  const score = store.rewards.getScore(did);
  const pal = usePalette("default");

  console.log("score",score);

  return (
    <View>
      <Text type="title-lg" style={[pal.text, s.bold, handleTextStyle]}>
        {store.me.displayName || store.me.handle.replace("live.solarplex.xyz", "")}

      </Text>
      <Text type="md-thin" style={styles.scoreText}>
        {score !== undefined ? `⭐️ ${score} Points` : "⭐️ 0 Points"}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  scoreText: { paddingTop: 2 },
});

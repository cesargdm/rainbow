import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rainbow-me/design-system';
import { bigNumberFormat } from '@rainbow-me/helpers/bigNumberFormat';
import { useAccountSettings } from '@rainbow-me/hooks';
import { padding } from '@rainbow-me/styles';

const FastPoolValue = ({
  type,
  value,
  theme,
}: {
  type: string;
  value: number;
  theme: any;
}) => {
  let formattedValue: number | string = value;
  const { colors } = theme;
  let color = type === 'oneDayVolumeUSD' ? colors.swapPurple : colors.appleBlue;
  const { nativeCurrency } = useAccountSettings();

  if (type === 'annualized_fees' || type === 'profit30d') {
    let percent: number = value;
    if (!percent || percent === 0) {
      formattedValue = '0%';
    }

    if (percent < 0.0001 && percent > 0) {
      formattedValue = '< 0.0001%';
    }

    if (percent < 0 && percent > -0.0001) {
      formattedValue = '< 0.0001%';
    }

    let fixedPercent = percent.toFixed(2);
    if (fixedPercent === '0.00') {
      formattedValue = '0%';
    }
    if (percent > 0) {
      color = colors.green;
      if (percent > 100) {
        formattedValue = `+${percent
          ?.toFixed(2)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}%`;
      } else {
        formattedValue = `+${fixedPercent}%`;
      }
    } else {
      formattedValue = `${fixedPercent}%`;
      color = colors.red;
    }
  } else if (type === 'liquidity' || type === 'oneDayVolumeUSD') {
    formattedValue = bigNumberFormat(value, nativeCurrency, value >= 10000);
  }
  return (
    <View
      style={[{ backgroundColor: colors.alpha(color, 0.06) }, cx.container]}
    >
      <Text color={{ custom: color }} size="16px" weight="bold">
        {formattedValue}
      </Text>
    </View>
  );
};

export default FastPoolValue;

const cx = StyleSheet.create({
  container: {
    borderRadius: 15,
    height: 30,
    ...padding.object(2, 9, 0),
    justifyContent: 'center',
  },
});
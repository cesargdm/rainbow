import { useRoute } from '@react-navigation/native';
import { captureException } from '@sentry/react-native';
import lang from 'i18n-js';
import { upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import {
  createdWithBiometricError,
  identifyWalletType,
  loadSeedPhraseAndMigrateIfNeeded,
} from '../../model/wallet';
import ActivityIndicator from '../ActivityIndicator';
import Spinner from '../Spinner';
import { BiometricButtonContent, Button } from '../buttons';
import { CopyFloatingEmojis } from '../floating-emojis';
import { Icon } from '../icons';
import SecretDisplayCard from './SecretDisplayCard';
import { Box, Inline, Stack, Text } from '@rainbow-me/design-system';
import WalletTypes from '@rainbow-me/helpers/walletTypes';
import { useWallets } from '@rainbow-me/hooks';
import styled from '@rainbow-me/styled-components';
import { margin, position, shadow } from '@rainbow-me/styles';
import logger from 'logger';

const CopyButtonIcon = styled(Icon).attrs(({ theme: { colors } }) => ({
  color: colors.appleBlue,
  name: 'copy',
}))({
  ...position.sizeAsObject(16),
  marginTop: 0.5,
});

const ToggleSecretButton = styled(Button)(({ theme: { colors } }) => ({
  ...margin.object(0, 20),
  ...shadow.buildAsObject(0, 5, 15, colors.purple, 0.3),
  backgroundColor: colors.appleBlue,
}));

const LoadingSpinner = android ? Spinner : ActivityIndicator;

export default function SecretDisplaySection({
  onSecretLoaded,
  onWalletTypeIdentified,
}) {
  const { params } = useRoute();
  const { selectedWallet, wallets } = useWallets();
  const walletId = params?.walletId || selectedWallet.id;
  const currentWallet = wallets[walletId];
  const [visible, setVisible] = useState(true);
  const [isRecoveryPhraseVisible, setIsRecoveryPhraseVisible] = useState(false);
  const [seed, setSeed] = useState(null);
  const [type, setType] = useState(currentWallet?.type);

  const loadSeed = useCallback(async () => {
    try {
      const s = await loadSeedPhraseAndMigrateIfNeeded(walletId);
      if (s) {
        const walletType = identifyWalletType(s);
        setType(walletType);
        onWalletTypeIdentified?.(walletType);
        setSeed(s);
      }
      setVisible(!!s);
      onSecretLoaded?.(!!s);
      setIsRecoveryPhraseVisible(!!s);
    } catch (e) {
      logger.sentry('Error while trying to reveal secret', e);
      if (e?.message === createdWithBiometricError) {
        setIsRecoveryPhraseVisible(false);
      }
      captureException(e);
      setVisible(false);
      onSecretLoaded?.(false);
    }
  }, [onSecretLoaded, onWalletTypeIdentified, walletId]);

  useEffect(() => {
    // Android doesn't like to show the faceID prompt
    // while the view isn't fully visible
    // so we have to add a timeout to prevent the app from freezing
    android
      ? setTimeout(() => {
          loadSeed();
        }, 300)
      : loadSeed();
  }, [loadSeed]);

  const typeLabel = type === WalletTypes.privateKey ? 'key' : 'phrase';

  const { colors } = useTheme();

  const renderStepNoSeeds = useCallback(() => {
    if (isRecoveryPhraseVisible) {
      return (
        <Box
          alignItems="center"
          justifyContent="center"
          paddingHorizontal="60px"
        >
          <Stack space="10px">
            <Text align="center" color="secondary" size="18px" weight="regular">
              {lang.t('back_up.secret.you_need_to_authenticate', {
                typeName: typeLabel,
              })}
            </Text>
            <ToggleSecretButton onPress={loadSeed}>
              <BiometricButtonContent
                color={colors.white}
                label={lang.t('back_up.secret.show_recovery', {
                  typeName: upperFirst(typeLabel),
                })}
                showIcon={!seed}
              />
            </ToggleSecretButton>
          </Stack>
        </Box>
      );
    } else {
      return (
        <Text align="center" color="secondary60" size="16px">
          Your account has been secured with biometric data, like fingerprint or
          face identification. To see your recovery phrase, turn on biometrics
          in your phone’s settings.
        </Text>
      );
    }
  }, [isRecoveryPhraseVisible, typeLabel, loadSeed, colors.white, seed]);
  return (
    <>
      {visible ? (
        <Box
          alignItems="center"
          justifyContent="center"
          marginHorizontal="16px"
          paddingHorizontal="30px"
        >
          {seed ? (
            <>
              <Box paddingBottom="19px">
                <CopyFloatingEmojis textToCopy={seed}>
                  <Inline alignVertical="center" space="6px">
                    <CopyButtonIcon />
                    <Text color="action" size="16px" weight="bold">
                      {lang.t('back_up.secret.copy_to_clipboard')}
                    </Text>
                  </Inline>
                </CopyFloatingEmojis>
              </Box>
              <Stack alignHorizontal="center" space="19px">
                <SecretDisplayCard seed={seed} type={type} />
                <Text containsEmoji size="16px" weight="bold">
                  👆{lang.t('back_up.secret.for_your_eyes_only')} 👆
                </Text>
                <Text
                  align="center"
                  color="secondary60"
                  size="16px"
                  weight="semibold"
                >
                  {lang.t('back_up.secret.anyone_who_has_these')}
                </Text>
              </Stack>
            </>
          ) : (
            <LoadingSpinner color={colors.blueGreyDark50} />
          )}
        </Box>
      ) : (
        renderStepNoSeeds()
      )}
    </>
  );
}

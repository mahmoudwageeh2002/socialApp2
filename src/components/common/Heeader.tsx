import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import LogoSvg from '../../assets/svgs/Logomark.svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const Header = ({
  title,
  hasBackButton,
  hasRightButton = true,
}: {
  title?: string;
  hasBackButton?: boolean;
  hasRightButton?: boolean;
}) => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasBackButton ? (
          <TouchableOpacity
            style={{ marginRight: 8 }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Icon
              name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <LogoSvg width={40} height={40} />
        )}
        <Text style={styles.logo}>{title || 'Sociallawy'} </Text>
      </View>
      <View>
        {hasRightButton && (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ChatStack', { screen: 'ChatList' });
            }}
          >
            <Icon
              name="send"
              size={24}
              color={colors.textSecondary}
              style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    // marginBottom
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    // marginBottom: 10,
  },
});
export default Header;

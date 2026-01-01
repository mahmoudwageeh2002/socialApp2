/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  isValidElement,
  ReactNode,
} from 'react';
import {
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollViewProps,
} from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height: SCREEN_H } = Dimensions.get('window');

/* ---------- Imperative Ref ---------- */
export interface BottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

/* ---------- Props ---------- */
export interface BottomSheetProps {
  children: ReactNode;
  snapPoints?: (string | number)[];
  backgroundColor?: string;
  index?: number;
  onChange?: (index: number) => void;
  canClose?: boolean;
  onClose?: () => void;
  scrollable?: boolean;
  Footer?: React.ComponentType<any> | React.ReactElement | undefined;
  TrueSheetScrollRef?: React.RefObject<any>;
  modalHeight?: number;
  showCloseIcon?: boolean;
  scrollProps?: ScrollViewProps;
  contentContainerStyle?: any;
}

/* ---------- Component ---------- */
const BottomSheetComponent = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      children,
      snapPoints = ['60%', '100%'],
      backgroundColor = '#fff',
      index = -1,
      onChange,
      canClose = true,
      onClose,
      scrollable = false,
      Footer, // can be a Component OR an Element
      TrueSheetScrollRef,
      modalHeight = Math.round(SCREEN_H * 0.85),
      showCloseIcon = true,
      scrollProps = {},
      contentContainerStyle,
    },
    ref,
  ) => {
    const trueSheetRef = useRef<TrueSheet | null>(null);
    const modalizeRef = useRef<Modalize | null>(null);

    const snapPointsMemo = useMemo(() => snapPoints, [snapPoints]);

    // Normalize Footer for iOS TrueSheet (expects a component)
    const TrueSheetFooter =
      typeof Footer === 'function'
        ? Footer
        : isValidElement(Footer)
        ? () => Footer
        : undefined;

    // Helper to render Footer on Android
    const renderFooter = () => {
      if (!Footer) return null;
      return isValidElement(Footer) ? Footer : <Footer />;
    };

    useImperativeHandle(ref, () => ({
      present: () => {
        if (Platform.OS === 'ios') {
          trueSheetRef.current?.present();
        } else {
          modalizeRef.current?.open();
        }
      },
      dismiss: () => {
        if (Platform.OS === 'ios') {
          trueSheetRef.current?.dismiss();
        } else {
          modalizeRef.current?.close();
        }
      },
    }));

    if (Platform.OS === 'ios') {
      return (
        <TrueSheet
          ref={trueSheetRef}
          sizes={snapPointsMemo as any}
          backgroundColor={backgroundColor}
          dismissOnPanDown
          FooterComponent={Footer as any}
          dimmed
          scrollRef={TrueSheetScrollRef}
          dimmedIndex={0.3}
          dismissOnOverlayPress
          onDismiss={onClose}
          onIndexChange={onChange}
          contentContainerStyle={[styles.sheetContainer, { backgroundColor }]}
        >
          {children}
        </TrueSheet>
      );
    }

    // ANDROID → Modalize with auto height and soft backdrop
    return (
      <Portal>
        <Modalize
          ref={modalizeRef}
          adjustToContentHeight
          handlePosition="inside"
          withHandle
          modalStyle={[styles.modalizeModal, { backgroundColor }]}
          overlayStyle={styles.modalizeOverlay} // light shadow, not full black
          closeOnOverlayTap={canClose}
          withOverlay
          panGestureEnabled={!scrollable}
          onClosed={onClose}
          FooterComponent={renderFooter as any}
          scrollViewProps={{
            showsVerticalScrollIndicator: true,
            keyboardShouldPersistTaps: 'handled',
            bounces: true,
            contentContainerStyle: [
              styles.modalizeContent,
              contentContainerStyle,
            ],
            ...scrollProps,
          }}
          keyboardAvoidingBehavior="padding"
          disableScrollIfPossible={false}
        >
          <View style={{ minHeight: 24 }}>
            {scrollable && (
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={modalizeRef.current?.close as any}
              >
                <Icon name="close" size={24} color="black" />
              </TouchableOpacity>
            )}
            {children}

            <View style={{ height: 16 }} />
          </View>
        </Modalize>
      </Portal>
    );
  },
);

export default BottomSheetComponent;

const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalizeOverlay: {
    backgroundColor: 'rgba(0,0,0,0.18)', // softer shadow
  },
  modalizeModal: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  modalizeContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 10,
    padding: 6,
    zIndex: 2,
  },
});

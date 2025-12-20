/* eslint-disable @typescript-eslint/no-unused-vars */
// ...existing code...
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../../../theme';

type AudioPayload = { uri: string; durationMs?: number };

function formatMs(ms?: number) {
  if (!ms || ms <= 0) return '0:00';
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AudioRow({
  isRight,
  audio,
}: {
  isRight: boolean;
  audio: AudioPayload;
}) {
  const [isReady, setReady] = React.useState(false);
  const [isPlaying, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // 0..1
  const [durationMs, setDurationMs] = React.useState<number | undefined>(
    audio.durationMs,
  );
  const [remainingMs, setRemainingMs] = React.useState<number | undefined>(
    audio.durationMs,
  );

  const soundRef = React.useRef<Sound | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    Sound.setCategory('Playback');
    const s = new Sound(audio.uri, undefined, err => {
      if (err) {
        console.warn('Audio load error', err);
        setReady(false);
        return;
      }
      const durSec = s.getDuration();
      const durMs = Math.round(durSec * 1000);
      setDurationMs(durMs);
      setRemainingMs(durMs);
      setReady(true);
    });
    soundRef.current = s;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      s.release();
    };
  }, [audio.uri]);

  const tick = React.useCallback(() => {
    const s = soundRef.current;
    if (!s) return;
    s.getCurrentTime(sec => {
      const durSec = s.getDuration() || (durationMs ? durationMs / 1000 : 0);
      if (durSec > 0) {
        const p = Math.min(sec / durSec, 1);
        setProgress(p);
        const remaining = Math.max(0, Math.round((durSec - sec) * 1000));
        setRemainingMs(remaining);
      }
    });
    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs]);

  const togglePlay = () => {
    const s = soundRef.current;
    if (!s || !isReady) return;
    if (isPlaying) {
      s.pause();
      setPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else {
      // If finished, restart
      s.getCurrentTime(sec => {
        const dur = s.getDuration();
        if (dur - sec < 0.01) s.setCurrentTime(0);
      });
      s.play(success => {
        setPlaying(false);
        setProgress(0);
        setRemainingMs(durationMs);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      });
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  // Static waveform bars for WhatsApp-like look
  const bars = React.useMemo(
    () => [
      0.25, 0.4, 0.6, 0.35, 0.5, 0.7, 0.3, 0.55, 0.45, 0.8, 0.5, 0.65, 0.35,
      0.6, 0.4, 0.75, 0.5, 0.55, 0.3, 0.7, 0.45, 0.6, 0.35, 0.5,
    ],
    [],
  );
  const activeBars = Math.round(progress * bars.length);

  const activeColor = isRight ? colors.onPrimary : colors.textPrimary;
  const baseColor = isRight ? `${colors.onPrimary}55` : colors.border;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={togglePlay}
        style={styles.playBtn}
        activeOpacity={0.8}
      >
        {isReady ? (
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={activeColor}
          />
        ) : (
          <ActivityIndicator size="small" color={activeColor} />
        )}
      </TouchableOpacity>

      <View style={styles.waveWrapper}>
        {bars.map((h, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: 18 + h * 22,
                backgroundColor: i < activeBars ? activeColor : baseColor,
              },
            ]}
          />
        ))}
      </View>

      <Text
        style={[
          styles.duration,
          { color: isRight ? colors.onPrimary : colors.textSecondary },
        ]}
      >
        {formatMs(remainingMs ?? durationMs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // keep everything inside the bubble
  row: {
    flexDirection: 'row',
    minWidth: '70%',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    // maxWidth: 350,
  },
  playBtn: { padding: spacing.xs },
  waveWrapper: {
    flex: 1, // use available bubble width
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 40, // slightly smaller to fit bubble nicely
  },
  bar: { width: 3, borderRadius: 2 },
  duration: { ...typography.caption },
});

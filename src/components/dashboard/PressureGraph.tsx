/**
 * 気圧グラフコンポーネント
 * 24時間の気圧変動をSVGで描画
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/theme';

export type PressurePoint = {
  time: string;
  pressure: number;
  status: 'danger' | 'caution' | 'stable';
};

type Props = {
  data: PressurePoint[];
  width?: number;
  height?: number;
};

// 気圧値を Y 座標に変換
const pressureToY = (pressure: number, height: number, minP: number, maxP: number): number => {
  const padding = 20;
  const graphHeight = height - padding * 2;
  const normalized = (pressure - minP) / (maxP - minP);
  return padding + graphHeight * (1 - normalized);
};

// データポイントからSVGパスを生成
const generatePath = (
  data: PressurePoint[],
  width: number,
  height: number,
  minP: number,
  maxP: number
): string => {
  if (data.length === 0) return '';

  const stepX = width / (data.length - 1);

  let path = `M 0 ${pressureToY(data[0].pressure, height, minP, maxP)}`;

  for (let i = 1; i < data.length; i++) {
    const x = i * stepX;
    const y = pressureToY(data[i].pressure, height, minP, maxP);

    // ベジェ曲線で滑らかに
    const prevX = (i - 1) * stepX;
    const prevY = pressureToY(data[i - 1].pressure, height, minP, maxP);
    const cpX = (prevX + x) / 2;

    path += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
  }

  return path;
};

// 塗りつぶし用のパスを生成
const generateFillPath = (
  data: PressurePoint[],
  width: number,
  height: number,
  minP: number,
  maxP: number
): string => {
  const linePath = generatePath(data, width, height, minP, maxP);
  return `${linePath} L ${width} ${height} L 0 ${height} Z`;
};

export default function PressureGraph({ data, width = 360, height = 160 }: Props) {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noData}>データがありません</Text>
      </View>
    );
  }

  // 気圧の範囲を計算
  const pressures = data.map((d) => d.pressure);
  const minPressure = Math.min(...pressures) - 5;
  const maxPressure = Math.max(...pressures) + 5;

  const linePath = generatePath(data, width, height, minPressure, maxPressure);
  const fillPath = generateFillPath(data, width, height, minPressure, maxPressure);

  // 危険ポイントを検出
  const dangerPoints = data
    .map((point, index) => ({
      ...point,
      x: (index / (data.length - 1)) * width,
      y: pressureToY(point.pressure, height, minPressure, maxPressure),
    }))
    .filter((point) => point.status === 'danger');

  // 最低点を検出
  const minPoint = data.reduce(
    (min, point, index) => {
      if (point.pressure < min.pressure) {
        return {
          ...point,
          x: (index / (data.length - 1)) * width,
          y: pressureToY(point.pressure, height, minPressure, maxPressure),
        };
      }
      return min;
    },
    { ...data[0], x: 0, y: pressureToY(data[0].pressure, height, minPressure, maxPressure) }
  );

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.danger} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={colors.surface} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* 塗りつぶし */}
        <Path d={fillPath} fill="url(#graphGradient)" />

        {/* ライン */}
        <Path
          d={linePath}
          stroke={colors.danger}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />

        {/* 最低点のマーカー */}
        <Circle cx={minPoint.x} cy={minPoint.y} r={4} fill={colors.dangerDark} />

        {/* 危険ポイントのマーカー */}
        {dangerPoints.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={colors.danger}
          />
        ))}
      </Svg>

      {/* 時間ラベル */}
      <View style={styles.timeLabels}>
        {['現在', '12:00', '18:00', '00:00', '06:00'].map((label, index) => (
          <Text key={index} style={styles.timeLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  noData: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  timeLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
});

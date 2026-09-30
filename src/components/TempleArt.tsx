import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** Sunset sky with a Jagannath-style temple silhouette, used behind the Home header. */
export function HeroBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="xMaxYMin slice">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D80E62" />
            <Stop offset="0.55" stopColor="#EE4A6A" />
            <Stop offset="1" stopColor="#FF9A5C" />
          </LinearGradient>
          <LinearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE7A3" />
            <Stop offset="1" stopColor="#FFB45E" />
          </LinearGradient>
        </Defs>
        <Rect width="400" height="250" fill="url(#sky)" />
        <Circle cx="362" cy="150" r="30" fill="url(#sun)" opacity={0.95} />

        {/* birds */}
        <G stroke="#5A0E2A" strokeWidth={1.6} fill="none" opacity={0.6}>
          <Path d="M262 104 q5 -5 10 0 q5 -5 10 0" />
          <Path d="M284 94 q4 -4 8 0 q4 -4 8 0" />
          <Path d="M246 116 q4 -4 8 0 q4 -4 8 0" />
        </G>

        {/* distant temples and trees */}
        <G fill="#9B1D45" opacity={0.5} transform="translate(0 -44)">
          <Path d="M20 230 L20 200 C22 186 30 176 36 172 C42 176 50 186 52 200 L52 230 Z" />
          <Path d="M150 230 L150 206 C152 194 158 188 163 185 C168 188 174 194 176 206 L176 230 Z" />
          <Circle cx="80" cy="212" r="18" />
          <Circle cx="104" cy="218" r="14" />
          <Circle cx="200" cy="216" r="16" />
        </G>

        {/* main temple: jagamohana + rekha deula */}
        <G transform="translate(158 50) scale(0.56)">
          <G fill="#7A1030">
            <Path d="M236 232 L236 204 L246 196 L240 196 L252 184 L246 184 L262 168 L278 184 L272 184 L284 196 L278 196 L288 204 L288 232 Z" />
            <Path d="M282 232 L282 196 C284 150 296 112 318 88 C340 112 352 150 354 196 L354 232 Z" />
            <Ellipse cx="318" cy="86" rx="15" ry="6" />
            <Path d="M312 82 L318 66 L324 82 Z" />
            <Rect x="317" y="40" width="2" height="28" />
            <Path d="M319 40 L336 46 L319 52 Z" fill="#FFB45E" />
          </G>
          <G stroke="#A8264F" strokeWidth={1} opacity={0.7}>
            <Path d="M296 200 L340 200 M292 180 L344 180 M296 160 L340 160 M301 140 L335 140 M307 120 L329 120" />
          </G>
        </G>
      </Svg>
    </View>
  );
}

/** Small temple glyph shown beside the tithi. */
export function TempleIcon({ size = 30, color = '#E0115F' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M16 4 L16 1" stroke={color} strokeWidth={1.5} />
      <Path d="M16 1 L21 2.5 L16 4 Z" fill={color} />
      <Ellipse cx="16" cy="7" rx="4" ry="1.6" fill={color} />
      <Path d="M9 29 L9 21 C9.5 15 12 10.5 16 8 C20 10.5 22.5 15 23 21 L23 29 Z" fill={color} />
      <Path d="M11 21 H21 M11.6 17 H20.4 M13 13 H19" stroke="#FFFFFF" strokeWidth={1} />
      <Rect x="14" y="23" width="4" height="6" rx="2" fill="#FFFFFF" />
      <Rect x="5" y="29" width="22" height="2" rx="1" fill={color} />
    </Svg>
  );
}

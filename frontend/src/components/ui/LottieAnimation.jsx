import React, { useMemo } from "react";
import Lottie from "lottie-react";

// Pre-defined Lottie animations as JSON objects
// These are simple, lightweight animations that can be used without external files

// Success checkmark animation
const successAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Success Checkmark",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Checkmark",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [50, 50, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [60, 60] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 10 },
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.133, 0.898, 0.443, 1] }, // Green color
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: "tr",
              p: { a: 0, k: [50, 50] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
        },
        {
          ty: "tm",
          s: {
            a: 1,
            k: [
              { t: 0, v: 0 },
              { t: 30, v: 100 },
            ],
          },
          e: { a: 0, k: 100 },
          o: { a: 0, k: 0 },
          m: 1,
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
};

// Loading spinner animation
const loadingAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Loading Spinner",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Spinner",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, v: 0 },
            { t: 60, v: 360 },
          ],
        },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [50, 50, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          d: 1,
          s: { a: 0, k: [40, 40] },
          p: { a: 0, k: [0, 0] },
        },
        {
          ty: "st",
          c: { a: 0, k: [0.761, 0.361, 0.2, 1] }, // Burnt orange
          o: { a: 0, k: 100 },
          w: { a: 0, k: 4 },
          lc: 2,
          lj: 1,
          ml: 4,
          bm: 0,
        },
        {
          ty: "tm",
          s: { a: 0, k: 0 },
          e: { a: 1, k: [{ t: 0, v: 25 }, { t: 30, v: 75 }] },
          o: {
            a: 1,
            k: [
              { t: 0, v: 0 },
              { t: 60, v: 360 },
            ],
          },
          m: 1,
        },
        {
          ty: "tr",
          p: { a: 0, k: [50, 50] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
          sk: { a: 0, k: 0 },
          sa: { a: 0, k: 0 },
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
};

// Error X animation
const errorAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 45,
  w: 100,
  h: 100,
  nm: "Error X",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "X Mark",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [50, 50, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [60, 60] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 10 },
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.918, 0.165, 0.165, 1] }, // Red color
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: "tr",
              p: { a: 0, k: [50, 50] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
        },
        {
          ty: "tm",
          s: {
            a: 1,
            k: [
              { t: 0, v: 0 },
              { t: 25, v: 100 },
            ],
          },
          e: { a: 0, k: 100 },
          o: { a: 0, k: 0 },
          m: 1,
        },
      ],
      ip: 0,
      op: 45,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
};

// Animation type mapping
const animationMap = {
  success: successAnimation,
  loading: loadingAnimation,
  error: errorAnimation,
};

// Size presets
const sizePresets = {
  sm: 40,
  md: 64,
  lg: 100,
  xl: 150,
};

export function LottieAnimation({
  type = "loading",
  size = "md",
  loop = true,
  autoplay = true,
  className = "",
  style = {},
  ...props
}) {
  const animationData = useMemo(() => animationMap[type] || loadingAnimation, [type]);

  const dimensions = typeof size === "number" ? size : sizePresets[size] || sizePresets.md;

  const containerStyle = {
    width: dimensions,
    height: dimensions,
    ...style,
  };

  return (
    <div className={className} style={containerStyle} {...props}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: "100%", height: "100%" }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
    </div>
  );
}

// Success animation component
export function SuccessAnimation(props) {
  return <LottieAnimation type="success" {...props} />;
}

// Loading animation component
export function LoadingAnimation(props) {
  return <LottieAnimation type="loading" {...props} />;
}

// Error animation component
export function ErrorAnimation(props) {
  return <LottieAnimation type="error" {...props} />;
}
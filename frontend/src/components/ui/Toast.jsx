import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { LottieAnimation } from "./LottieAnimation";

// Motion div for animated toast
const MotionDiv = motion.div;

// Toast variants
const toastVariants = {
  initial: {
    opacity: 0,
    y: -20,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Icon mapping based on toast type
const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  loading: Loader2,
};

// Color mapping based on toast type
const colorMap = {
  success: "text-emerald-500 border-emerald-500/50 bg-emerald-500/10",
  error: "text-red-500 border-red-500/50 bg-red-500/10",
  info: "text-blue-500 border-blue-500/50 bg-blue-500/10",
  loading: "text-amber-500 border-amber-500/50 bg-amber-500/10",
};

export function Toast({
  message = "",
  kind = "info",
  onClear,
  duration = 5000,
  showIcon = true,
  showClose = true,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(!!message);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setProgress(100);

      // Progress bar animation
      const startTime = Date.now();
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1 - elapsed / duration);
        setProgress(remaining * 100);

        if (remaining > 0) {
          requestAnimationFrame(animateProgress);
        }
      };
      requestAnimationFrame(animateProgress);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClear, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [message, duration, onClear]);

  const Icon = iconMap[kind] || Info;
  const colors = colorMap[kind] || colorMap.info;

  if (!message) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDiv
          className={`fixed top-24 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-md shadow-2xl ${colors} ${className}`}
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="alert"
          aria-live="polite"
        >
          {/* Animated icon */}
          {showIcon && (
            <div className="flex-shrink-0">
              {kind === "loading" ? (
                <LottieAnimation type="loading" size={24} />
              ) : kind === "success" ? (
                <LottieAnimation type="success" size={24} />
              ) : kind === "error" ? (
                <LottieAnimation type="error" size={24} />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
          )}

          {/* Message */}
          <p className="flex-1 text-sm font-medium text-white">{message}</p>

          {/* Close button */}
          {showClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClear, 300);
              }}
              className="flex-shrink-0 rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Progress bar */}
          {duration > 0 && (
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-white/30 transition-none"
              style={{
                width: `${progress}%`,
              }}
            />
          )}
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

// Simplified toast for backward compatibility
export function SimpleToast({ kind = "success", message = "", onClear }) {
  return (
    <Toast
      message={message}
      kind={kind}
      onClear={onClear}
      duration={4000}
    />
  );
}
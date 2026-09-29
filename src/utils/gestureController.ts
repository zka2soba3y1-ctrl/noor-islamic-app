/**
 * Advanced Sensory Gesture Controller for Noor Islamic Project
 * Provides reliable multi-touch and single-touch gesture detection
 * with immediate haptic vibration and audio feedback for blind users
 */

import type React from "react";
import { soundEngine } from "./soundEngine";
import { speechEngine } from "./speechEngine";

export interface GestureCallbacks {
  onDoubleTap?: () => void;
  onSingleTap?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTwoFingerTap?: () => void;
  onThreeFingerTap?: () => void;
  onLongPress?: () => void;
}

export class GestureHandler {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private touchCount = 1;
  private lastTapTime = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private isSwiping = false;

  constructor(private callbacks: GestureCallbacks) {}

  public onTouchStart = (e: React.TouchEvent | TouchEvent) => {
    this.touchCount = e.touches.length;
    this.startTime = Date.now();
    this.isSwiping = false;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;

      // Start long press detection (700ms)
      if (this.callbacks.onLongPress) {
        this.longPressTimer = setTimeout(() => {
          soundEngine.vibrate([60, 40, 80]);
          this.callbacks.onLongPress?.();
        }, 700);
      }
    } else if (e.touches.length === 2) {
      // Clear long press if multi-touch
      if (this.longPressTimer) clearTimeout(this.longPressTimer);
    } else if (e.touches.length === 3) {
      if (this.longPressTimer) clearTimeout(this.longPressTimer);
    }
  };

  public onTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.startX;
      const deltaY = touch.clientY - this.startY;

      // If user moved significantly, cancel long press
      if (Math.abs(deltaX) > 25 || Math.abs(deltaY) > 25) {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
        this.isSwiping = true;
      }
    }
  };

  public onTouchEnd = (e: React.TouchEvent | TouchEvent) => {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const duration = Date.now() - this.startTime;

    // Handle 2-finger tap
    if (this.touchCount === 2 && duration < 350) {
      soundEngine.playGestureTwoFingerTap();
      this.callbacks.onTwoFingerTap?.();
      return;
    }

    // Handle 3-finger tap
    if (this.touchCount === 3 && duration < 400) {
      soundEngine.vibrate([40, 30, 40]);
      this.callbacks.onThreeFingerTap?.();
      return;
    }

    // Handle single finger gestures
    if (this.touchCount === 1) {
      const touch = e.changedTouches?.[0];
      if (!touch) return;

      const deltaX = touch.clientX - this.startX;
      const deltaY = touch.clientY - this.startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Swipe detection (threshold: 45px)
      if (this.isSwiping && (absX > 45 || absY > 45)) {
        if (absX > absY) {
          if (deltaX > 0) {
            // Swipe Right
            soundEngine.playGestureSwipe("right");
            this.callbacks.onSwipeRight?.();
          } else {
            // Swipe Left
            soundEngine.playGestureSwipe("left");
            this.callbacks.onSwipeLeft?.();
          }
        } else {
          if (deltaY > 0) {
            soundEngine.playGestureSwipe("down");
            this.callbacks.onSwipeDown?.();
          } else {
            soundEngine.playGestureSwipe("up");
            this.callbacks.onSwipeUp?.();
          }
        }
        return;
      }

      // Tap / Double Tap detection
      const now = Date.now();
      const timeSinceLastTap = now - this.lastTapTime;

      if (timeSinceLastTap < 320 && timeSinceLastTap > 30) {
        // Double tap confirmed
        this.lastTapTime = 0;
        soundEngine.playGestureDoubleTap();
        this.callbacks.onDoubleTap?.();
      } else {
        this.lastTapTime = now;
        // Delay single tap slightly to distinguish from double tap
        setTimeout(() => {
          if (this.lastTapTime === now) {
            this.callbacks.onSingleTap?.();
          }
        }, 300);
      }
    }
  };
}

/**
 * DoubleShakeDetector
 * Detects two consecutive phone shakes in a row (هز الموبايل مرتين ورا بعض)
 * and triggers the voice assistant with warm greeting and haptics
 */
export class DoubleShakeDetector {
  private lastX: number | null = null;
  private lastY: number | null = null;
  private lastZ: number | null = null;
  private lastShakeTime = 0;
  private shakeCount = 0;
  private resetTimer: any = null;
  private isListening = false;
  private onDoubleShake: () => void;
  private threshold: number;

  constructor(onDoubleShake: () => void, threshold = 18) {
    this.onDoubleShake = onDoubleShake;
    this.threshold = threshold;
  }

  public start() {
    if (typeof window === "undefined" || this.isListening) return;

    // Check if permission is needed on iOS 13+
    const devMotion = window.DeviceMotionEvent as any;
    if (devMotion && typeof devMotion.requestPermission === "function") {
      // iOS permission is usually granted on first touch, or requested
      window.addEventListener(
        "touchstart",
        () => {
          devMotion
            .requestPermission()
            .then((state: string) => {
              if (state === "granted") {
                window.addEventListener("devicemotion", this.handleMotion);
              }
            })
            .catch(() => {});
        },
        { once: true }
      );
    }

    if ("DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", this.handleMotion);
      this.isListening = true;
    }
  }

  public stop() {
    if (typeof window === "undefined" || !this.isListening) return;
    window.removeEventListener("devicemotion", this.handleMotion);
    this.isListening = false;
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const x = acc.x;
    const y = acc.y;
    const z = acc.z;

    if (this.lastX !== null && this.lastY !== null && this.lastZ !== null) {
      const deltaX = Math.abs(x - this.lastX);
      const deltaY = Math.abs(y - this.lastY);
      const deltaZ = Math.abs(z - this.lastZ);

      const delta = deltaX + deltaY + deltaZ;
      const now = Date.now();

      if (delta > this.threshold) {
        // Debounce: must be at least 260ms after previous shake movement
        if (now - this.lastShakeTime > 260) {
          this.shakeCount += 1;
          this.lastShakeTime = now;

          if (this.resetTimer) clearTimeout(this.resetTimer);

          if (this.shakeCount >= 2) {
            // Two shakes confirmed in sequence!
            this.shakeCount = 0;
            soundEngine.vibrate([80, 50, 120]);
            this.onDoubleShake();
          } else {
            // Wait up to 1300ms for the second shake
            this.resetTimer = setTimeout(() => {
              this.shakeCount = 0;
            }, 1300);
          }
        }
      }
    }

    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
  };
}


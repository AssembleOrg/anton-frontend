/**
 * Motion Library - Centralized animation constants
 * Premium, Apple-inspired timing and easing curves
 */

export const easings = {
  luxury: [0.16, 1, 0.3, 1] as [number, number, number, number], // Main easing (existing)
  entrance: [0.16, 1, 0.3, 1] as [number, number, number, number], // Card entrance
  exit: [0.4, 0, 0.6, 1] as [number, number, number, number], // Page exit
  interactive: [0.4, 0, 0.2, 1] as [number, number, number, number], // Hover/tap
  smooth: [0.25, 0.1, 0.25, 1] as [number, number, number, number], // General transitions
};

export const durations = {
  instant: 0.15,
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  verySlow: 1.2,
};

export const transitions = {
  cardEntrance: {
    duration: durations.slow,
    ease: easings.entrance,
  },
  cardHover: {
    duration: durations.fast,
    ease: easings.interactive,
  },
  pageTransition: {
    duration: durations.normal,
    ease: easings.luxury,
  },
  tap: {
    duration: durations.instant,
    ease: easings.interactive,
  },
};

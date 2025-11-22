// AI Performance & Coaching System Utilities

/**
 * GLOBAL ACTIVATION RULE
 * All AI systems only activate when viewerCount >= 1
 */
export const shouldActivateAI = (viewerCount) => {
  return viewerCount >= 1;
};

/**
 * Hint types and their default messages
 */
export const HINT_TYPES = {
  silence_detected: {
    messages: [
      "Long silence detected — say something warm!",
      "Break the silence — your viewers are waiting!",
      "Keep talking — silence can lose viewers!"
    ],
    icon: "🔇",
    priority: "medium"
  },
  low_facial_expression: {
    messages: [
      "Smile more — your audience loves it 😊",
      "Show some expression — let your personality shine!",
      "Your face tells a story — make it engaging!"
    ],
    icon: "😊",
    priority: "medium"
  },
  low_voice_energy: {
    messages: [
      "Your energy is dropping — try lifting it a little",
      "Boost your voice energy — enthusiasm is contagious!",
      "Speak with more energy — your viewers will feel it!"
    ],
    icon: "🔊",
    priority: "medium"
  },
  idle_detected: {
    messages: [
      "Movement low — adjust posture or gesture",
      "Get animated — movement keeps attention!",
      "You seem idle — try moving or gesturing more!"
    ],
    icon: "⚡",
    priority: "high"
  },
  chat_ignored: {
    messages: [
      "Respond to chat to keep engagement alive",
      "You missed a chat message — replying helps retention!",
      "Chat needs love — respond to keep viewers engaged!"
    ],
    icon: "💬",
    priority: "high"
  },
  new_viewer_unacknowledged: {
    messages: [
      "A viewer just joined — try greeting them 👋",
      "New viewer alert — welcome them warmly!",
      "Say hello to your new viewer — first impressions matter!"
    ],
    icon: "👋",
    priority: "high"
  },
  negative_tone: {
    messages: [
      "Your tone feels negative — try something uplifting!",
      "Positive vibes attract viewers — adjust your energy!",
      "Shift to a warmer tone — viewers love positivity!"
    ],
    icon: "💙",
    priority: "medium"
  },
  low_movement: {
    messages: [
      "Try moving more — animation keeps viewers engaged!",
      "Physical energy matters — gesture and move!",
      "Static streams lose viewers — get active!"
    ],
    icon: "🏃",
    priority: "low"
  },
  viewer_drop: {
    messages: [
      "Viewer count dropping — boost your energy now!",
      "Keep them engaged — viewers are leaving!",
      "Re-engage fast — retention is critical!"
    ],
    icon: "⚠️",
    priority: "critical"
  }
};

/**
 * Get random hint message for a type
 */
export const getRandomHintMessage = (hintType) => {
  const hints = HINT_TYPES[hintType];
  if (!hints || !hints.messages) return "Stay engaging!";
  const messages = hints.messages;
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Calculate if hint was ignored (behavior didn't improve after 10 seconds)
 */
export const wasHintIgnored = (hintTimestamp, improvementTimestamp) => {
  if (!improvementTimestamp) return true;
  const timeDiff = new Date(improvementTimestamp) - new Date(hintTimestamp);
  return timeDiff > 10000; // More than 10 seconds = ignored
};

/**
 * Warning stage thresholds
 */
export const WARNING_THRESHOLDS = {
  STAGE_1: 20, // First warning at 20 ignored hints
  STAGE_2: 20, // Second warning at another 20 ignored hints
  STAGE_3: 20  // Final escalation at another 20 ignored hints
};

/**
 * Warning messages by stage
 */
export const WARNING_MESSAGES = {
  1: {
    title: "Performance Notice - First Warning",
    message: "Your engagement was low during your last session. Please check your AI Performance Center for tips to improve.",
    tone: "gentle"
  },
  2: {
    title: "Performance Alert - Second Warning",
    message: "Your performance showed repeated low engagement. Please improve to avoid a formal review.",
    tone: "firm"
  },
  3: {
    title: "Performance Escalation",
    message: "Your performance has been escalated for admin review due to continued low engagement.",
    tone: "serious"
  }
};

/**
 * Calculate overall performance score (0-100)
 * Hidden formula - broadcasters only see the result
 */
export const calculateOverallScore = (scores) => {
  const weights = {
    engagement: 0.20,
    smile: 0.15,
    voice: 0.15,
    movement: 0.10,
    chat_responsiveness: 0.20,
    retention: 0.10,
    warmth: 0.05,
    idle_reduction: 0.05
  };

  let total = 0;
  let totalWeight = 0;

  Object.keys(weights).forEach(key => {
    const scoreKey = `${key}_score`;
    if (scores[scoreKey] !== undefined && scores[scoreKey] !== null) {
      total += scores[scoreKey] * weights[key];
      totalWeight += weights[key];
    }
  });

  return totalWeight > 0 ? Math.round(total / totalWeight) : 0;
};

/**
 * Determine visibility boost based on score
 */
export const getVisibilityBoost = (overallScore) => {
  if (overallScore >= 90) return 2.0;  // Double visibility
  if (overallScore >= 80) return 1.5;  // 50% boost
  if (overallScore >= 70) return 1.2;  // 20% boost
  if (overallScore >= 60) return 1.0;  // Normal visibility
  if (overallScore >= 50) return 0.8;  // 20% reduction
  return 0.5; // 50% reduction for poor performers
};

/**
 * Format coaching sensitivity setting
 */
export const COACHING_SENSITIVITY = {
  high: { label: "High Coaching", frequency: 1.0, description: "Maximum coaching and hints" },
  medium: { label: "Medium Coaching", frequency: 0.6, description: "Balanced coaching" },
  low: { label: "Low Coaching", frequency: 0.3, description: "Minimal hints" },
  emergency: { label: "Emergency Only", frequency: 0.1, description: "Only critical alerts" }
};
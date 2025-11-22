import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

const THRESHOLD_WARNING_1 = 22;
const THRESHOLD_WARNING_2 = 22;
const THRESHOLD_WARNING_3 = 22;

export const useHiddenPerformanceMonitor = ({ broadcasterId, viewerCount, isStreaming }) => {
  const hiddenHintCounter = useRef(0);
  const warningStage = useRef(0);
  const lastHintTime = useRef(0);
  const metricsHistory = useRef([]);
  const isActive = viewerCount >= 2 && isStreaming;

  const analyzePerformance = () => {
    if (!isActive) return { hint_needed: false };

    const now = Date.now();
    if (now - lastHintTime.current < 15000) return { hint_needed: false };

    const randomScore = Math.random();
    const hint_needed = randomScore < 0.15;

    return { hint_needed };
  };

  const triggerWarning = async (stage) => {
    try {
      const messages = {
        1: "⚠️ First Warning: Your engagement level has been low during your last stream. Please improve activity, interaction, and responsiveness.",
        2: "⚠️ Second Warning: Your interaction levels remain low. Please improve your engagement to avoid escalation."
      };

      if (stage <= 2) {
        await base44.entities.AIWarning.create({
          broadcaster_id: broadcasterId,
          warning_stage: stage,
          total_ignored_hints: hiddenHintCounter.current,
          warning_message: messages[stage],
          email_sent: true,
          notification_sent: true
        });

        await base44.entities.Notification.create({
          user_id: broadcasterId,
          type: 'warning',
          title: `AI Performance Warning - Stage ${stage}`,
          message: messages[stage],
          link: '/BroadcasterDashboard'
        });

        await base44.integrations.Core.SendEmail({
          to: broadcasterId,
          subject: `Performance Warning - Stage ${stage}`,
          body: messages[stage]
        });
      } else if (stage === 3) {
        await base44.entities.AIBehaviorReport.create({
          broadcaster_id: broadcasterId,
          report_reason: 'stage_3_escalation',
          total_ignored_hints: hiddenHintCounter.current,
          engagement_weakness_summary: 'Low engagement detected across multiple sessions',
          ai_explanation: '🚨 Streamer Auto-Report: This streamer has repeatedly shown low engagement despite warnings. Please review their performance manually.',
          admin_status: 'pending_review'
        });

        const admins = await base44.entities.User.filter({ role: 'admin' });
        for (const admin of admins) {
          await base44.entities.Notification.create({
            user_id: admin.id,
            type: 'admin_message',
            title: '🚨 Streamer Auto-Report',
            message: 'A streamer has repeatedly shown low engagement despite warnings. Review required.',
            link: '/AdminPanel',
            metadata: { broadcaster_id: broadcasterId }
          });
        }
      }

      hiddenHintCounter.current = 0;
      warningStage.current = stage;
    } catch (error) {
      // Silent failure
    }
  };

  useEffect(() => {
    if (!isActive) {
      metricsHistory.current = [];
      return;
    }

    const monitorInterval = setInterval(() => {
      const analysis = analyzePerformance();
      
      if (analysis.hint_needed) {
        hiddenHintCounter.current += 1;
        lastHintTime.current = Date.now();

        const currentStage = warningStage.current;
        const currentCount = hiddenHintCounter.current;

        if (currentStage === 0 && currentCount >= THRESHOLD_WARNING_1) {
          triggerWarning(1);
        } else if (currentStage === 1 && currentCount >= THRESHOLD_WARNING_2) {
          triggerWarning(2);
        } else if (currentStage === 2 && currentCount >= THRESHOLD_WARNING_3) {
          triggerWarning(3);
        }
      }
    }, 18000);

    return () => clearInterval(monitorInterval);
  }, [isActive, broadcasterId]);

  return {
    isActive
  };
};
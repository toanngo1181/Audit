import { useMemo } from 'react';
import { ChecklistItem, AuditItemState, ModuleConfig, ScoringConfig, AuditStatus } from '../types';

export const useScoring = (
  checklist: ChecklistItem[],
  itemStates: Record<string, AuditItemState>,
  moduleConfigs?: ModuleConfig[],
  scoringConfig?: ScoringConfig
) => {
  return useMemo(() => {
    let totalWeight = 0;
    let earnedWeight = 0;
    let criticalFail = false;
    let completedItems = 0;

    // 1. Tính toán từng câu hỏi
    checklist.forEach(item => {
      const state = itemStates[item.id];
      const weight = item.weight || 0;
      
      // Nếu câu hỏi đã được trả lời (Có status khác PENDING)
      if (state && state.status !== AuditStatus.PENDING) {
        completedItems++;
        totalWeight += weight;

        if (state.status === AuditStatus.PASS) {
          earnedWeight += weight;
        } else if (state.status === AuditStatus.FAIL) {
          // Kiểm tra lỗi nghiêm trọng
          if (item.risk === 'Critical' || item.risk === 'NGHIÊM TRỌNG') {
            criticalFail = true;
          }
        }
      }
    });

    // 2. Tính điểm tổng (0 - 100%)
    let finalScore = 0;
    if (totalWeight > 0) {
      finalScore = (earnedWeight / totalWeight) * 100;
    }

    // 3. Logic "Điểm liệt" (Nếu bật config)
    if (scoringConfig?.criticalRuleEnabled && criticalFail) {
      // Nếu dính lỗi nghiêm trọng thì điểm tối đa chỉ được bằng giới hạn (ví dụ 80%)
      if (finalScore > scoringConfig.criticalLimit) {
        finalScore = scoringConfig.criticalLimit;
      }
    }

    // Làm tròn 1 chữ số thập phân
    finalScore = Math.round(finalScore * 10) / 10;

    return {
      finalScore,
      earnedWeight,
      totalWeight,
      criticalFail,
      completedItems,
      totalItems: checklist.length,
      scoringConfig: scoringConfig || { 
        criticalRuleEnabled: false, 
        criticalLimit: 0,
        thresholds: { green: 90, yellow: 80, orange: 70 } 
      }
    };

  }, [checklist, itemStates, moduleConfigs, scoringConfig]);
};
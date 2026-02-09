
import { ChecklistItem, AuditItemState, AuditStatus, ModuleScore, ScoringConfig, ModuleConfig, FarmAuditResult } from '../types';

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  criticalRuleEnabled: true,
  criticalLimit: 80,
  thresholds: {
    green: 90,
    yellow: 80,
    orange: 65,
  }
};

export const calculateModuleScores = (
  items: ChecklistItem[],
  states: Record<string, AuditItemState>,
  moduleConfigs: ModuleConfig[]
): ModuleScore[] => {
  const modules = Array.from(new Set(items.map(i => i.module)));
  
  return modules.map(modName => {
    const modItems = items.filter(i => i.module === modName);
    const modConfig = moduleConfigs.find(c => c.module === modName) || { module: modName, module_weight: 1 };
    
    let totalWeight = 0;
    let earnedWeight = 0;
    
    modItems.forEach(item => {
      const weight = Number(item.weight || 0);
      totalWeight += weight;
      if (states[item.id]?.status === AuditStatus.PASS) {
        earnedWeight += weight;
      }
    });

    const score = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
    
    return {
      module: modName,
      score,
      totalWeight,
      earnedWeight,
      moduleWeight: modConfig.module_weight
    };
  });
};

export const calculateFinalScore = (
  moduleScores: ModuleScore[],
  items: ChecklistItem[],
  states: Record<string, AuditItemState>,
  config: ScoringConfig
): FarmAuditResult => {
  // 1. Weighted Average of Module Scores
  let sumWeightedScores = 0;
  let sumModuleWeights = 0;
  
  moduleScores.forEach(ms => {
    sumWeightedScores += ms.score * ms.moduleWeight;
    sumModuleWeights += ms.moduleWeight;
  });

  let finalScore = sumModuleWeights > 0 ? sumWeightedScores / sumModuleWeights : 0;

  // 2. Critical Fail Rule
  const hasCriticalFail = items.some(item => 
    String(item.risk).toUpperCase() === 'CRITICAL' && 
    states[item.id]?.status === AuditStatus.FAIL
  );

  if (config.criticalRuleEnabled && hasCriticalFail) {
    finalScore = Math.min(finalScore, config.criticalLimit);
  }

  const completedItems = items.filter(item => states[item.id]?.status !== AuditStatus.PENDING).length;

  return {
    finalScore,
    moduleScores,
    criticalFail: hasCriticalFail,
    totalItems: items.length,
    completedItems
  };
};

export const getRiskColorClass = (score: number, config: ScoringConfig): string => {
  if (score >= config.thresholds.green) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (score >= config.thresholds.yellow) return 'text-amber-600 bg-amber-50 border-amber-100';
  if (score >= config.thresholds.orange) return 'text-orange-600 bg-orange-50 border-orange-100';
  return 'text-rose-600 bg-rose-50 border-rose-100';
};

export const getScoreColorHex = (score: number, config: ScoringConfig): string => {
  if (score >= config.thresholds.green) return '#10b981';
  if (score >= config.thresholds.yellow) return '#f59e0b';
  if (score >= config.thresholds.orange) return '#f97316';
  return '#f43f5e';
};

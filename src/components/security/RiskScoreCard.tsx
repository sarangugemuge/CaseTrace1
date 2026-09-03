'use client';

import React from 'react';
import { RiskAssessment } from '../../services/riskEngine';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RiskBadge } from '../common/Badge';

export const RiskScoreCard: React.FC<{ assessment: RiskAssessment }> = ({ assessment }) => {
  const getMeterColor = () => {
    if (assessment.riskScore >= 76) return 'bg-rose-500';
    if (assessment.riskScore >= 51) return 'bg-orange-500';
    if (assessment.riskScore >= 26) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg font-mono text-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Access Anomaly & Risk Engine Assessment
        </span>
        <RiskBadge level={assessment.riskLevel} />
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>COMPUTED ANOMALY SCORE:</span>
            <span className="font-bold text-white">{assessment.riskScore} / 100</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${getMeterColor()}`}
              style={{ width: `${assessment.riskScore}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-slate-400">ASSESSMENT REASONING:</span>
          <p className="text-slate-200 text-[11px] mt-0.5 bg-slate-950 p-2 rounded border border-slate-800">
            {assessment.reason}
          </p>
        </div>

        <div>
          <span className="text-slate-400">RECOMMENDED SECURITY ACTION:</span>
          <p className="text-blue-300 text-[11px] mt-0.5 font-sans font-medium">
            {assessment.recommendedAction}
          </p>
        </div>
      </div>
    </div>
  );
};

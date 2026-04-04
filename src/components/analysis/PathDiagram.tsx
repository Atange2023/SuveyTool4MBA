import type { FullAnalysisResult, ModelConfig } from '../../lib/pls-sem/types';

interface PathDiagramProps {
  result: FullAnalysisResult;
  modelConfig: ModelConfig;
}

const DEFAULT_POS: Record<string, { x: number; y: number }> = {
  '感知易用性': { x: 120, y: 100 },
  '感知有用性': { x: 350, y: 50 },
  '信任感': { x: 120, y: 280 },
  '使用态度': { x: 520, y: 190 },
  '使用意愿': { x: 720, y: 190 },
};

export function PathDiagram({ result, modelConfig }: PathDiagramProps) {
  const constructs = modelConfig.constructs;
  const getPos = (name: string) => DEFAULT_POS[name] || { x: 200, y: 200 };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 880 380" className="w-full" style={{ minHeight: 300 }}>
        <defs>
          <marker id="arrow-default" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#9ca3af" />
          </marker>
          <marker id="arrow-sig" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#2570e8" />
          </marker>
        </defs>

        {modelConfig.paths.map((path, idx) => {
          const from = getPos(path.from);
          const to = getPos(path.to);
          const coef = result.pls.pathCoefficients[path.to]?.[path.from] ?? 0;
          const stats = result.bootstrap.pathCoefficients[path.to]?.[path.from];
          const sig = stats?.significant ?? false;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;
          const ux = dx / dist;
          const uy = dy / dist;
          const x1 = from.x + ux * 58;
          const y1 = from.y + uy * 28;
          const x2 = to.x - ux * 58;
          const y2 = to.y - uy * 28;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - 14;

          return (
            <g key={idx}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={sig ? '#2570e8' : '#d1d5db'}
                strokeWidth={sig ? 2.5 : 1.5}
                markerEnd={sig ? 'url(#arrow-sig)' : 'url(#arrow-default)'}
                strokeDasharray={sig ? '' : '6,4'}
              />
              <rect x={mx - 26} y={my - 10} width={52} height={20} rx={4}
                fill={sig ? '#eff8ff' : '#f9fafb'} stroke={sig ? '#bfdffd' : '#e5e7eb'} />
              <text x={mx} y={my + 4} textAnchor="middle" fontSize="11"
                fontWeight="600" fill={sig ? '#1d5bd5' : '#9ca3af'}>
                {coef.toFixed(3)}
              </text>
              {stats && (
                <text x={mx} y={my + 30} textAnchor="middle" fontSize="9" fill="#9ca3af">
                  {sig ? `p=${stats.pValue.toFixed(3)}` : 'n.s.'}
                </text>
              )}
            </g>
          );
        })}

        {constructs.map(c => {
          const pos = getPos(c.name);
          const r2 = result.pls.rSquared[c.name];
          const isEndo = r2 !== undefined;
          return (
            <g key={c.name}>
              <ellipse
                cx={pos.x} cy={pos.y} rx={54} ry={26}
                fill={isEndo ? '#eff8ff' : '#f0fdf4'}
                stroke={isEndo ? '#3b8ff3' : '#22c55e'}
                strokeWidth={2}
              />
              <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize="12"
                fontWeight="600" fill="#1e293b">
                {c.name}
              </text>
              {r2 !== undefined && (
                <text x={pos.x} y={pos.y + 12} textAnchor="middle" fontSize="10" fill="#6b7280">
                  R²={r2.toFixed(3)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

import type { FullAnalysisResult, ModelConfig } from '../../lib/pls-sem/types';

interface PathDiagramProps {
  result: FullAnalysisResult;
  modelConfig: ModelConfig;
}

const DEFAULT_POS: Record<string, { x: number; y: number }> = {
  '感知易用性': { x: 130, y: 100 },
  '感知有用性': { x: 370, y: 55 },
  '信任感': { x: 130, y: 280 },
  '使用态度': { x: 540, y: 190 },
  '使用意愿': { x: 740, y: 190 },
};

export function PathDiagram({ result, modelConfig }: PathDiagramProps) {
  const constructs = modelConfig.constructs;
  const getPos = (name: string) => DEFAULT_POS[name] || { x: 200, y: 200 };

  return (
    <div className="w-full overflow-x-auto py-2">
      <svg viewBox="0 0 880 370" className="w-full" style={{ minHeight: 280 }}>
        <defs>
          <marker id="arr-muted" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#c8c7c3" />
          </marker>
          <marker id="arr-active" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="7" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#37352f" />
          </marker>
          <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.06" />
          </filter>
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
          const x1 = from.x + ux * 62;
          const y1 = from.y + uy * 28;
          const x2 = to.x - ux * 62;
          const y2 = to.y - uy * 28;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;

          return (
            <g key={idx}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={sig ? '#37352f' : '#d1d0cd'}
                strokeWidth={sig ? 2 : 1}
                markerEnd={sig ? 'url(#arr-active)' : 'url(#arr-muted)'}
                strokeDasharray={sig ? '' : '5,4'}
                opacity={sig ? 1 : 0.6}
              />
              <rect
                x={mx - 28} y={my - 22} width={56} height={18} rx={3}
                fill={sig ? '#f7f6f3' : '#fbfbfa'}
                stroke={sig ? '#e9e9e7' : '#f0efed'}
                strokeWidth={0.5}
              />
              <text x={mx} y={my - 10} textAnchor="middle" fontSize="10"
                fontWeight={sig ? '600' : '400'}
                fontFamily="Inter, sans-serif"
                fill={sig ? '#37352f' : '#9b9a97'}>
                {coef.toFixed(3)}{sig ? '*' : ''}
              </text>
            </g>
          );
        })}

        {constructs.map(c => {
          const pos = getPos(c.name);
          const r2 = result.pls.rSquared[c.name];
          const isEndo = r2 !== undefined;
          return (
            <g key={c.name} filter="url(#node-shadow)">
              <rect
                x={pos.x - 56} y={pos.y - 24} width={112} height={48} rx={6}
                fill="white"
                stroke={isEndo ? '#d1d0cd' : '#e9e9e7'}
                strokeWidth={1}
              />
              <text x={pos.x} y={pos.y - 3} textAnchor="middle" fontSize="12"
                fontWeight="600" fontFamily="'Noto Sans SC', sans-serif"
                fill="#37352f">
                {c.name}
              </text>
              {r2 !== undefined && (
                <text x={pos.x} y={pos.y + 14} textAnchor="middle" fontSize="10"
                  fontFamily="Inter, sans-serif" fill="#9b9a97">
                  R²={r2.toFixed(3)}
                </text>
              )}
              {!isEndo && (
                <rect
                  x={pos.x - 56} y={pos.y - 24} width={112} height={3} rx={1.5}
                  fill="#2eaadc" opacity={0.6}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

import { Badge } from './Badge';

interface MetricCardProps {
  label: string;
  value: number | string;
  threshold?: number;
  thresholdDirection?: 'above' | 'below';
  description?: string;
}

export function MetricCard({
  label, value, threshold, thresholdDirection = 'above', description,
}: MetricCardProps) {
  const numVal = typeof value === 'number' ? value : parseFloat(value);
  const isPass = threshold !== undefined
    ? thresholdDirection === 'above' ? numVal >= threshold : numVal <= threshold
    : true;
  const displayVal = typeof value === 'number' ? value.toFixed(3) : value;

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      isPass ? 'border-notion-border bg-notion-bg' : 'border-danger-200 bg-danger-50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-notion-text-secondary font-medium uppercase tracking-wide">{label}</span>
        {threshold !== undefined && (
          <Badge variant={isPass ? 'success' : 'danger'} size="sm">
            {isPass ? '通过' : '未达标'}
          </Badge>
        )}
      </div>
      <div className={`text-xl font-bold tracking-tight ${isPass ? 'text-notion-text' : 'text-danger-600'}`}>
        {displayVal}
      </div>
      {description && (
        <p className="text-[10px] text-notion-text-tertiary mt-1.5">{description}</p>
      )}
      {threshold !== undefined && (
        <p className="text-[10px] text-notion-text-tertiary mt-0.5">
          阈值: {thresholdDirection === 'above' ? '>=' : '<='} {threshold}
        </p>
      )}
    </div>
  );
}

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
    <div className={`p-4 rounded-lg border ${isPass ? 'border-gray-200 bg-white' : 'border-danger-200 bg-danger-50'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        {threshold !== undefined && (
          <Badge variant={isPass ? 'success' : 'danger'} size="sm">
            {isPass ? '通过' : '未达标'}
          </Badge>
        )}
      </div>
      <div className={`text-2xl font-bold ${isPass ? 'text-gray-900' : 'text-danger-600'}`}>
        {displayVal}
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      {threshold !== undefined && (
        <p className="text-xs text-gray-400 mt-1">
          阈值: {thresholdDirection === 'above' ? '>=' : '<='} {threshold}
        </p>
      )}
    </div>
  );
}

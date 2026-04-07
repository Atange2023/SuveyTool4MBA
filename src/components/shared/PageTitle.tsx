export function PageTitle({ children, sub, right }: { children: React.ReactNode; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-notion-text tracking-tight leading-tight">{children}</h1>
        {sub && <p className="text-[13px] text-notion-text-secondary mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

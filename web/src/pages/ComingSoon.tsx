export function ComingSoonPage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="coming-soon">
      <h1>{title}</h1>
      <p className="text-muted">{subtitle ?? '该功能在后续版本规划中'}</p>
      <span className="badge badge-pending">P3 规划</span>
    </div>
  );
}

export default function AppLoading() {
  return (
    <main className="px-5 pt-14 pb-6 animate-pulse">
      <div className="h-4 w-24 bg-surface-dim rounded mb-1.5" />
      <div className="h-8 w-40 bg-surface-dim rounded mb-6" />

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="h-20 bg-surface rounded-2xl" />
        <div className="h-20 bg-surface rounded-2xl" />
      </div>

      <div className="h-5 w-32 bg-surface-dim rounded mb-3" />
      <div className="space-y-3">
        <div className="h-14 bg-surface rounded-xl" />
        <div className="h-14 bg-surface rounded-xl" />
        <div className="h-14 bg-surface rounded-xl" />
      </div>
    </main>
  );
}

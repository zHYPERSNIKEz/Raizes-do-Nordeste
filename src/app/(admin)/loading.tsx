export default function AdminLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-64 bg-slate-800/80 rounded-lg" />
        <div className="h-4 w-96 bg-slate-800/50 rounded-md" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-800" />
            </div>
            <div className="h-7 w-32 bg-slate-800/90 rounded" />
            <div className="h-3 w-40 bg-slate-800/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Grid Skeleton */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-12 w-full bg-slate-800/40 rounded-xl flex items-center justify-between px-4"
            >
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-4 w-20 bg-slate-800 rounded" />
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="h-6 w-16 bg-slate-800/60 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

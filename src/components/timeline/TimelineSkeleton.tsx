export default function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className={`flex items-start gap-6 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
        >
          <div className="flex-1 w-full">
            <div className="card p-6">
              <div className="flex gap-3 mb-4">
                <div className="h-4 w-20 bg-text-light/20 rounded animate-pulse" />
                <div className="h-4 w-24 bg-text-light/20 rounded animate-pulse" />
              </div>
              <div className="h-8 w-full bg-text-light/20 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-text-light/20 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-text-light/20 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-text-light/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-text-light/20 animate-pulse" />
            <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-transparent" />
          </div>
          <div className="w-48 h-32 bg-text-light/20 rounded-lg animate-pulse flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
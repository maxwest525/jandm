import { Card } from './ui/Card'
import { Skeleton } from './ui/Skeleton'

export function LoadingState() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="mt-4 h-3.5 w-24" />
            <Skeleton className="mt-2.5 h-7 w-32" />
            <Skeleton className="mt-3 h-3 w-20" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <Card className="h-[340px] xl:col-span-3">
          <div className="p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-6 h-[240px] w-full" />
          </div>
        </Card>
        <Card className="h-[340px] xl:col-span-2">
          <div className="flex flex-col items-center p-5">
            <Skeleton className="mb-6 h-4 w-40 self-start" />
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </div>
        </Card>
      </div>
    </div>
  )
}

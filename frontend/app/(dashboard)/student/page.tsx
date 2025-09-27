import { UserCards } from "@/components/UserCards"
import { AppAreaChart } from "@/components/AppAreaChart"

const page = () => {
  return (
<div className="p-0 flex gap-4 flex-col lg:flex-row">
  {/* LEFT */}
  <div className="flex-1 min-w-0 flex flex-col gap-4">
    <UserCards />
    <AppAreaChart />
  </div>

  {/* RIGHT */}
  <div className="w-full lg:w-1/3 min-w-0">
    RIGHT
  </div>
</div>

  )
}

export default page

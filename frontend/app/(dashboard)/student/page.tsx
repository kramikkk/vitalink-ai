import { UserCards } from "@/components/UserCards"
import { AppAreaChart } from "@/components/AppAreaChart"
import { AlertCards } from "@/components/AlertCards"
import SummaryStatistics from "@/components/SummaryStatistics"
import { WellnessScore } from "@/components/WellnessScore"
import UserProfileCard from "@/components/UserProfileCard"

const page = () => {
  return (
<div className="p-0 flex gap-4 flex-col lg:flex-row items-stretch pb-4">
  {/* LEFT */}
  <div className="flex-1 min-w-0 flex flex-col gap-4">
    <UserCards />
    <AppAreaChart />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
      <WellnessScore />
      <UserProfileCard/>
    </div>
  </div>

  {/* RIGHT */}
  <div className="w-full lg:w-1/3 min-w-[300px] flex flex-col gap-4">
    <AlertCards />
    <SummaryStatistics />
  </div>
</div>


  )
}

export default page
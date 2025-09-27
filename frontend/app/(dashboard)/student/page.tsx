import { UserCards } from "@/components/UserCards"
import { AppAreaChart } from "@/components/AppAreaChart"

const page = () => {
  return (
    <div className="p-0 flex gap-4 flex-col md:flex-row">
      {/*LEFT*/}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <UserCards />   
        <div className="">
          <AppAreaChart />
        </div>
      </div>
      {/*RIGHT*/}
      <div className="w-full lg:w-1/3">
      RIGHT
      </div>
    </div>
  )
}

export default page
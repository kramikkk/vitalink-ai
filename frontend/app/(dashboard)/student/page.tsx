import { UserCards } from "@/components/UserCards"

const page = () => {
  return (
    <div className="p-0 flex gap-4 flex-col md:flex-row">
      {/*LEFT*/}
      <div className="w-full lg:w-2/3">
        <UserCards />
      </div>
      {/*RIGHT*/}
      <div className="w-full lg:w-1/3">
      RIGHT
      </div>
    </div>
  )
}

export default page
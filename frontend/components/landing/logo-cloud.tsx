import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

export default function LogoCloud() {
    return (
        <section className="bg-background overflow-hidden py-16">
            <div className="group relative m-auto max-w-7xl px-6">
                <div className="flex flex-col items-center md:flex-row">
                    <div className="md:max-w-44 md:border-r md:pr-6">
                        <p className="text-end text-xl">Tech Stack</p>
                    </div>
                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            speedOnHover={20}
                            speed={40}
                            gap={112}>
                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit dark:invert"
                                    src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg"
                                    alt="NextJS Logo"
                                    height="32"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit dark:invert"
                                    src="https://cdn.simpleicons.org/shadcnui"
                                    alt="ShadCN Logo"
                                    height="32"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit dark:invert"
                                    src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Vercel_logo_2025.svg"
                                    alt="Vercel Logo"
                                    height="32"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit dark:invert"
                                    src="https://cdn.simpleicons.org/fastapi/black"
                                    alt="FastAPI Logo"
                                    height="32"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit dark:invert"
                                    src="https://cdn.simpleicons.org/tailwindcss/black"
                                    alt="Tailwind CSS Logo"
                                    height="32"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit dark:invert"
                                    src="https://cdn.simpleicons.org/scikitlearn/black"
                                    alt="Scikit Learn Logo"
                                    height="32"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit dark:invert"
                                    src="https://cdn.simpleicons.org/prisma/black"
                                    alt="Prisma Logo"
                                    height="32"
                                    width="auto"
                                />
                            </div>

                            <div className="flex">
                                <img
                                    className="mx-auto h-8 w-fit dark:invert"
                                    src="https://cdn.simpleicons.org/supabase/black"
                                    alt="Supabase Logo"
                                    height="32"
                                    width="auto"
                                />
                            </div>
                        </InfiniteSlider>

                        <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                        <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

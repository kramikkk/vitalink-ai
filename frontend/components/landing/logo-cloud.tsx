import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

export default function LogoCloud() {
    return (
            <div className="group relative m-auto max-w-7xl px-4 py-8 md:px-6 md:py-16">
                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-0">
                    <div className="md:max-w-44 md:border-r md:pr-6">
                        <p className="text-center md:text-end text-lg md:text-xl font-medium">Tech Stack</p>
                    </div>
                    <div className="relative py-4 w-full md:py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            speedOnHover={20}
                            speed={40}
                            gap={112}>
                            <div className="flex items-center justify-center w-24">
                                <img
                                    className="mx-auto h-7 w-auto max-w-full object-contain dark:invert"
                                    src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg"
                                    alt="NextJS Logo"
                                />
                            </div>
                            <div className="flex items-center justify-center w-24">
                                <img
                                    className="mx-auto h-7 w-auto max-w-full object-contain dark:invert"
                                    src="https://cdn.simpleicons.org/shadcnui"
                                    alt="ShadCN Logo"
                                />
                            </div>
                            <div className="flex items-center justify-center w-24">
                                <img
                                    className="mx-auto h-7 w-auto max-w-full object-contain dark:invert"
                                    src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Vercel_logo_2025.svg"
                                    alt="Vercel Logo"
                                />
                            </div>
                            <div className="flex items-center justify-center w-24">
                                <img
                                    className="mx-auto h-7 w-auto max-w-full object-contain dark:invert"
                                    src="https://cdn.simpleicons.org/fastapi/black"
                                    alt="FastAPI Logo"
                                />
                            </div>
                            <div className="flex items-center justify-center w-24">
                                <img
                                    className="mx-auto h-7 w-auto max-w-full object-contain dark:invert"
                                    src="https://cdn.simpleicons.org/tailwindcss/black"
                                    alt="Tailwind CSS Logo"
                                />
                            </div>
                            <div className="flex items-center justify-center w-24">
                                <img
                                    className="mx-auto h-7 w-auto max-w-full object-contain dark:invert"
                                    src="https://cdn.simpleicons.org/scikitlearn/black"
                                    alt="Scikit Learn Logo"
                                />
                            </div>
                            <div className="flex items-center justify-center w-24">
                                <img
                                    className="mx-auto h-7 w-auto max-w-full object-contain dark:invert"
                                    src="https://cdn.simpleicons.org/sqlite/black"
                                    alt="SQLite Logo"
                                />
                            </div>

                            <div className="flex items-center justify-center w-24">
                                <img
                                    className="mx-auto h-7 w-auto max-w-full object-contain dark:invert"
                                    src="https://cdn.simpleicons.org/render/black"
                                    alt="Render Logo"
                                />
                            </div>
                        </InfiniteSlider>

                        <div className="bg-gradient-to-r from-background absolute inset-y-0 left-0 w-12 md:w-20"></div>
                        <div className="bg-gradient-to-l from-background absolute inset-y-0 right-0 w-12 md:w-20"></div>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-12 md:w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-12 md:w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
    )
}

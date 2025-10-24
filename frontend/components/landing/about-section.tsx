import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Target, Eye } from 'lucide-react'
import { ReactNode } from 'react'

export default function AboutSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">About</h2>
                </div>
                <div className="mx-auto mt-8 grid max-w-5xl gap-6 text-center md:mt-8 md:grid-cols-2 place-items-center">
                    <Card className="group border-0 shadow-none bg-transparent gap-2">
                        <CardHeader className="pb-2">
                            <CardDecorator>
                                <Target
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-4 font-medium text-2xl italic">Mission</h3>
                        </CardHeader>

                        <CardContent className="pt-2">
                            <p className="text-sm italic">To promote student well-being through continuous monitoring of vital signs and activity levels using IoT and AI technology, empowering schools to make informed decisions that support health, focus, and academic performance.</p>
                        </CardContent>
                    </Card>

                    <Card className="group border-0 shadow-none bg-transparent gap-2">
                        <CardHeader className="pb-2">
                            <CardDecorator>
                                <Eye
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-4 font-medium text-2xl italic">Vision</h3>
                        </CardHeader>

                        <CardContent className="pt-2">
                            <p className="text-sm italic">To create a healthier, smarter, and more connected learning environment where technology actively supports every student's physical and mental wellness.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
       
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
        />

        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)

'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default function FAQs() {
    const faqItems: FAQItem[] = [
        {
            id: 'item-1',
            icon: 'heart-pulse',
            question: 'What does the Vitalink AI system do?',
            answer: "Vitalink monitors students' heart rate and activity levels in real time using IoT sensors, helping detect stress or fatigue early.",
        },
        {
            id: 'item-2',
            icon: 'brain',
            question: 'How does Vitalink AI detect stress?',
            answer: 'It uses AI (Isolation Forest algorithm) to analyze patterns from heart rate and motion data, identifying unusual readings that may indicate stress or exhaustion.',
        },
        {
            id: 'item-3',
            icon: 'user',
            question: 'Do students need to log in to view their data?',
            answer: 'Yes. Each student has a secure account to access their personal wellness dashboard and track their daily activity trends.',
        },
        {
            id: 'item-4',
            icon: 'layout-dashboard',
            question: 'Who can access the dashboard?',
            answer: 'Students can view their own data, while teachers or health staff have access to summarized reports and alerts for monitoring overall student wellness.',
        },
        {
            id: 'item-5',
            icon: 'shield-check',
            question: 'Is the data private and secure?',
            answer: 'Absolutely. All information is transmitted securely via the ESP32 microcontroller and stored in a protected database with role-based access control.',
        },
    ]

    return (
        <section id="faqs" className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can't find what you're looking for? Contact our{' '}
                                <Link
                                    href="#team"
                                    className="text-primary font-medium hover:underline">
                                    VitaLinkAI Team
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className="m-auto size-4"
                                                />
                                            </div>
                                            <span className="text-base">{item.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{item.answer}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}

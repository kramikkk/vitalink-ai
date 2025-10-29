import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Avatar } from '../ui/avatar'

export const Logo = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Avatar className='w-12 h-12'>
                <Image
                                        src="/VitaLinkLogoCircleTrans.png"
                                        alt="VitaLink AI"
                                        width={48}
                                        height={48}
                                        className="rounded-lg"
                                    />
                                </Avatar>
                                <span className="font-bold text-lg">VitaLink AI</span>
        </div>
    )
}
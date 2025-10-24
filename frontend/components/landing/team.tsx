const members = [
    {
        name: 'Mark Jeric B. Exconde',
        role: 'Frontend Dev',
        avatar: 'https://avatars.githubusercontent.com/u/133881252?s=96&v=4',
    },
    {
        name: 'Jasmine Q. Macalintal',
        role: 'Hardware Dev',
        avatar: 'https://avatars.githubusercontent.com/u/182427008?v=4',
    },
    {
        name: 'Zyra Mae G. Flores',
        role: 'Backend Dev',
        avatar: 'https://avatars.githubusercontent.com/u/230315831?v=4',
    },
    {
        name: 'John Raymon D. Guran',
        role: 'AI Specialist',
        avatar: 'https://avatars.githubusercontent.com/u/230206709?v=4',
    },
    {
        name: 'Jhun Mark E. Canlas',
        role: 'Hardware Engineer',
        avatar: '/',
    },
]

export default function TeamSection() {
    return (
        <section id="team" className="py-12 md:py-32">
            <div className="mx-auto max-w-6xl px-8 lg:px-0">
                <h2 className="mb-8 text-4xl font-bold md:mb-16 lg:text-5xl text-center">Our team</h2>
                <div>
                    <h3 className="mb-4 text-lg font-medium">VitaLink AI Team</h3>
                    <div className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-3 lg:grid-cols-5">
                        {members.map((member, index) => (
                            <div key={index}>
                                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                    <img className="aspect-square rounded-full object-cover" src={member.avatar} alt={member.name} height="460" width="460" loading="lazy" />
                                </div>
                                <span className="mt-2 block text-sm">{member.name}</span>
                                <span className="text-muted-foreground block text-xs">{member.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

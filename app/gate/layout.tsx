import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Melo2Text - 访问验证',
    description: '请输入访问密钥以继续',
}

export default function GateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}

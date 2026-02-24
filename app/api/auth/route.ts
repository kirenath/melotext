import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'melotext_access'
const COOKIE_VALUE = 'authorized'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 天（秒）

export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json()

        const accessKey = process.env.ACCESS_KEY

        if (!accessKey) {
            console.error('ACCESS_KEY 环境变量未设置')
            return NextResponse.json(
                { error: '服务器配置错误' },
                { status: 500 }
            )
        }

        if (!key || key !== accessKey) {
            return NextResponse.json(
                { error: '密钥无效，请重试' },
                { status: 401 }
            )
        }

        // 密钥正确，设置授权 Cookie
        const response = NextResponse.json({ success: true })

        response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json(
            { error: '请求格式错误' },
            { status: 400 }
        )
    }
}

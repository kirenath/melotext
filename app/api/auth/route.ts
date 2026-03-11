import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'melotext_access'
const COOKIE_VALUE_AUTHORIZED = 'authorized'
const COOKIE_VALUE_PREVIEW = 'preview'
const MODE_COOKIE_NAME = 'melotext_mode'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 天（秒）

/**
 * POST /api/auth — 密钥验证（正式 / 预览）
 */
export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json()

        const accessKey = process.env.ACCESS_KEY
        const previewKey = process.env.PREVIEW_KEY

        if (!accessKey) {
            console.error('ACCESS_KEY 环境变量未设置')
            return NextResponse.json(
                { error: '服务器配置错误' },
                { status: 500 }
            )
        }

        // 匹配正式密钥
        if (key && key === accessKey) {
            return buildCookieResponse(COOKIE_VALUE_AUTHORIZED)
        }

        // 匹配预览密钥
        if (previewKey && key && key === previewKey) {
            return buildCookieResponse(COOKIE_VALUE_PREVIEW, true)
        }

        return NextResponse.json(
            { error: '密钥无效，请重试' },
            { status: 401 }
        )
    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json(
            { error: '请求格式错误' },
            { status: 400 }
        )
    }
}

/**
 * GET /api/auth?preview=true — 一键进入演示模式（Gate 页按钮使用）
 */
export async function GET(request: NextRequest) {
    const isPreview = request.nextUrl.searchParams.get('preview') === 'true'

    if (isPreview) {
        return buildCookieResponse(COOKIE_VALUE_PREVIEW, true)
    }

    return NextResponse.json({ error: '无效请求' }, { status: 400 })
}

/**
 * DELETE /api/auth — 退出登录（清除 cookie）
 */
export async function DELETE() {
    const response = NextResponse.json({ success: true })

    // 清除主认证 cookie
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    })

    // 清除模式标识 cookie
    response.cookies.set(MODE_COOKIE_NAME, '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    })

    return response
}

/** 构建带授权 Cookie 的响应 */
function buildCookieResponse(cookieValue: string, isPreview = false) {
    const response = NextResponse.json({
        success: true,
        preview: isPreview,
    })

    // 主认证 cookie（httpOnly，不可被前端读取）
    response.cookies.set(COOKIE_NAME, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    })

    // 模式标识 cookie（可被前端读取，用于 UI 展示）
    response.cookies.set(MODE_COOKIE_NAME, isPreview ? 'preview' : 'full', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    })

    return response
}

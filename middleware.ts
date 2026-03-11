import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'melotext_access'
const COOKIE_VALUE_AUTHORIZED = 'authorized'
const COOKIE_VALUE_PREVIEW = 'preview'

/** 演示模式下的 mock 响应 */
const PREVIEW_MOCK: Record<string, { status: number; body: object }> = {
    '/api/transcribe': {
        status: 200,
        body: {
            success: true,
            text: '[演示模式] これは、音声認識のデモンストレーションです。実際の文字起こし結果はここに表示されます。この機能を使用するには、正式なアクセスキーが必要です。',
            srt: '1\n00:00:00,000 --> 00:00:05,000\n[演示模式] これは、音声認識のデモンストレーションです。\n\n2\n00:00:05,000 --> 00:00:10,000\n実際の文字起こし結果はここに表示されます。\n\n3\n00:00:10,000 --> 00:00:14,000\nこの機能を使用するには、正式なアクセスキーが必要です。',
            vtt: 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n[演示模式] これは、音声認識のデモンストレーションです。\n\n00:00:05.000 --> 00:00:10.000\n実際の文字起こし結果はここに表示されます。\n\n00:00:10.000 --> 00:00:14.000\nこの機能を使用するには、正式なアクセスキーが必要です。',
        },
    },
    '/api/translate': {
        status: 200,
        body: {
            success: true,
            translation: '[演示模式] 这是语音识别的演示。实际的转录结果将显示在这里。要使用此功能，您需要正式的访问密钥。',
        },
    },
    '/api/r2-upload': {
        status: 403,
        body: { error: '演示模式下不支持文件上传，请使用正式访问密钥' },
    },
    '/api/r2-delete': {
        status: 403,
        body: { error: '演示模式下不支持文件删除，请使用正式访问密钥' },
    },
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 检查 Cookie 中的授权标记
    const accessCookie = request.cookies.get(COOKIE_NAME)
    const cookieValue = accessCookie?.value
    const isAuthorized = cookieValue === COOKIE_VALUE_AUTHORIZED
    const isPreview = cookieValue === COOKIE_VALUE_PREVIEW

    // ── 正式授权用户 ──
    if (isAuthorized) {
        if (pathname === '/gate') {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    // ── 预览用户 ──
    if (isPreview) {
        // 预览用户访问 /gate 也重定向到主页
        if (pathname === '/gate') {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // auth API 始终放行（登出等操作需要）
        if (pathname.startsWith('/api/auth')) {
            return NextResponse.next()
        }

        // 其他 API → 返回 mock 数据
        if (pathname.startsWith('/api/')) {
            const mock = PREVIEW_MOCK[pathname]
            if (mock) {
                return NextResponse.json(mock.body, { status: mock.status })
            }
            // 未知 API → 拒绝
            return NextResponse.json(
                { error: '演示模式下此功能不可用' },
                { status: 403 }
            )
        }

        // 页面请求 → 放行，并在 header 注入预览标记供前端读取
        const response = NextResponse.next()
        response.headers.set('X-Preview-Mode', 'true')
        return response
    }

    // ── 未授权用户 ──

    // API 请求返回 401（排除 auth API 本身）
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
        return NextResponse.json(
            { error: '未授权访问，请先输入访问密钥' },
            { status: 401 }
        )
    }

    // 页面请求重定向到 /gate
    if (pathname !== '/gate' && !pathname.startsWith('/api/auth')) {
        return NextResponse.redirect(new URL('/gate', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * 匹配所有请求路径，排除：
         * - _next/static (静态文件)
         * - _next/image (图片优化)
         * - favicon.ico (网站图标)
         * - public 目录下的静态资源
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}

import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'melotext_access'
const COOKIE_VALUE = 'authorized'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 检查 Cookie 中是否有有效的授权标记
    const accessCookie = request.cookies.get(COOKIE_NAME)
    const isAuthorized = accessCookie?.value === COOKIE_VALUE

    // 已授权 → 放行
    if (isAuthorized) {
        // 如果已授权用户访问 /gate，重定向到主页
        if (pathname === '/gate') {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    // 未授权 → API 请求返回 401（排除 auth API 本身）
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
        return NextResponse.json(
            { error: '未授权访问，请先输入访问密钥' },
            { status: 401 }
        )
    }

    // 未授权 → 页面请求重定向到 /gate
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

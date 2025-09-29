import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/uploads/avatars/')) {
    console.log('🖼️ Middleware: Servindo imagem:', request.nextUrl.pathname)
    
    const response = NextResponse.next()
    
    if (request.nextUrl.pathname.endsWith('.webp')) {
      response.headers.set('Content-Type', 'image/webp')
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      console.log('🖼️ Middleware: Headers WebP aplicados')
    }
    
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/uploads/avatars/(.*)',
  ],
}

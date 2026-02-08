import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session
  const { data: { session } } = await supabase.auth.getSession();
  console.log("[Middleware] Path:", request.nextUrl.pathname);
  console.log("[Middleware] Session exists:", !!session);
  console.log("[Middleware] Session ID:", session?.user?.id);
  console.log("[Middleware] All cookies:", request.cookies.getAll().map(c => c.name));

  // Protect routes - only authenticated users can access
  const protectedRoutes = ["/dashboard", "/session", "/history"];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    console.log("[Middleware] ❌ REDIRECTING TO HOME - no session found for protected route");
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  if (isProtectedRoute && session) {
    console.log("[Middleware] ✅ ALLOWING ACCESS - session found for protected route");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
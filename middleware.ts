import { NextResponse, type NextRequest } from "next/server";
import PocketBase from "pocketbase";

export async function middleware(request: NextRequest) {
  // Let Server Action requests pass straight through. Redirecting an action
  // POST (e.g. to /login) makes the client throw
  // "An unexpected response was received from the server." The actions
  // themselves + the PocketBase collection rules still enforce auth.
  if (request.headers.get("next-action")) {
    return NextResponse.next({ request });
  }

  const pb = new PocketBase(
    process.env.NEXT_PUBLIC_PB_URL ?? "https://prodlogonline.atensai.com"
  );

  const token = request.cookies.get("pb_auth")?.value;
  if (token) {
    pb.authStore.loadFromCookie(`pb_auth=${token}`, "pb_auth");
    try {
      await pb.collection("users").authRefresh();
    } catch {
      pb.authStore.clear();
    }
  }

  const authed = pb.authStore.isValid;

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/ideas") ||
    path.startsWith("/share-manage");
  const isLogin = path === "/login";

  if (!authed && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (authed && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/dashboard/:path*", "/ideas/:path*", "/share-manage/:path*", "/login"],
};

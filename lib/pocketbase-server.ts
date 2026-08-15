import { cache } from "react";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { PB_URL } from "./pb";

/**
 * Create a PocketBase client bound to the current request's auth cookie.
 *
 * The PocketBase auth cookie is named `pb_auth` and holds the auth token. We
 * load it, then call `authRefresh()` to validate it and fetch the full user
 * record. The result is memoized for the duration of the request.
 */
export const createServerPB = cache(async () => {
  const pb = new PocketBase(PB_URL);

  // During SSR the same query can be issued multiple times (e.g. generateMetadata
  // + the page) and the SDK's auto-cancellation aborts the earlier request,
  // causing "The request was aborted (autocancelled)" errors. Disable it.
  pb.autoCancellation(false);

  const cookieStore = await cookies();
  const token = cookieStore.get("pb_auth")?.value;

  if (token) {
    pb.authStore.loadFromCookie(`pb_auth=${token}`, "pb_auth");
    try {
      // Validates the token and loads the full user record into authStore.
      await pb.collection("users").authRefresh();
    } catch {
      // Token expired / invalid — clear it so we behave as logged-out.
      pb.authStore.clear();
    }
  }

  return pb;
});

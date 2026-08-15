"use client";

import PocketBase from "pocketbase";
import { PB_URL } from "./pb";

let pb: PocketBase | null = null;

/** Shared browser PocketBase client (singleton per page load). */
export function createClientPB() {
  if (!pb) pb = new PocketBase(PB_URL);
  return pb;
}

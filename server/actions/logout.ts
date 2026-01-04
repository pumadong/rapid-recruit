"use server";

import { logout as logoutAction } from "./auth";

export async function handleLogout() {
  await logoutAction();
}


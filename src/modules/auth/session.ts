import { auth } from "./auth";
import { UserService } from "@/modules/users/user.service";

/**
 * Gets the current authenticated session user and profile, or null if unauthenticated.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await UserService.getUserById(session.user.id);
  return user;
}

/**
 * Ensures the user is authenticated; throws an error or redirects if not.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required.");
  }
  return user;
}

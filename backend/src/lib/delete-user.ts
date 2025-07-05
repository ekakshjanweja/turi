import type { Session, User } from "better-auth";
import { db } from "./db";
import {
  user as userTable,
  verification as verificationTable,
  session as sessionTable,
} from "./db/schema/auth";
import { eq } from "drizzle-orm";

export async function deleteUser({
  user,
  session,
}: {
  user: User;
  session: Session;
}) {
  try {
    // Start a transaction to ensure all deletions succeed or fail together
    await db.transaction(async (tx) => {
      // Delete verification records associated with this user's email
      await tx
        .delete(verificationTable)
        .where(eq(verificationTable.identifier, user.email));

      // Delete the user record
      // This will automatically cascade delete:
      // - session records (due to onDelete: 'cascade')
      // - account records (due to onDelete: 'cascade')
      await tx.delete(userTable).where(eq(userTable.id, user.id));
    });
  } catch (error) {
    console.error(`Failed to delete user: ${user.id}`, error);
    throw new Error(
      `Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function signOut({
  user,
  session,
}: {
  user: User;
  session: Session;
}) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(sessionTable).where(eq(sessionTable.id, session.id));
    });
  } catch (error) {
    console.error(`Failed to sign out: ${user.id}`, error);
    throw new Error(
      `Failed to sign out: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

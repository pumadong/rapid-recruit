import { Header } from "./header";
import { getCurrentUserName, getCurrentUserId, getCurrentUser } from "@/server/queries/session";

export async function HeaderWrapper() {
  const userId = await getCurrentUserId();
  let currentUser = null;

  if (userId) {
    const user = await getCurrentUser();
    const userName = await getCurrentUserName();
    
    if (user) {
      currentUser = {
        id: user.id,
        userName,
        userType: user.userType,
      };
    }
  }

  return <Header currentUser={currentUser} />;
}


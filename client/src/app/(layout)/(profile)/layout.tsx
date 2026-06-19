// `app/profile/layout.tsx`

import Profile from "../../../components/profile/profile";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Profile>{children}</Profile>;
}

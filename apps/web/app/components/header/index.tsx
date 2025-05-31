import { User } from "~/models/user";

import { ProfileMenu } from "./profile";

interface Props {
  user: User;
  onSignout: () => void;
}

export const Header: React.FC<Props> = ({ user, onSignout }) => {
  return (
    <div className="flex h-14 w-full items-center justify-between border-b">
      <div className="pl-5">
        <span className="text-3xl font-extrabold text-black">LOGO</span>
      </div>

      <div className="pr-5">
        <ProfileMenu me={user} onSignout={onSignout} />
      </div>
    </div>
  );
};

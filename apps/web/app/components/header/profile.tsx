import { LogOutIcon, Settings2Icon, User2Icon } from "lucide-react";
import { Button, Separator } from "react-aria-components";

import { Menu, MenuItem, MenuPopover, MenuTrigger } from "~/components/ui/menu";
import { User } from "~/models/user";

export interface Props {
  me: User;
  onSignout: () => void;
}

export const ProfileMenu: React.FC<Props> = ({ me, onSignout }) => {
  return (
    <MenuTrigger>
      <Button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-gray-200 hover:bg-gray-100">
        <User2Icon />
      </Button>
      <MenuPopover placement="bottom end" shouldFlip={false}>
        <div className=" px-3 py-2">
          <div className="flex flex-col">
            <span className=" text-base text-gray-600">{me.name}</span>
            <span className="text-xs text-gray-600">{me.email}</span>
          </div>
        </div>

        <Separator className="my-1" />

        <Menu className="w-52">
          <MenuItem onAction={onSignout}>
            <div className=" flex items-center gap-2">
              <Settings2Icon size={16} />
              <span>Settings</span>
            </div>
          </MenuItem>
          <MenuItem onAction={onSignout}>
            <div className=" flex items-center gap-2">
              <LogOutIcon size={16} />
              <span>Sign out</span>
            </div>
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
};

import React from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOutIcon, UserIcon } from "lucide-react";

export function UserMenu() {
  const { user, admin, loading, logout } = useAuth();

  if (loading) {
    return <div className="h-9 w-9 rounded-full bg-secondary animate-pulse" />;
  }

  if (!user || !admin) {
    return (
      <Button asChild size="sm" variant="secondary">
        <a href="/login">Login</a>
      </Button>
    );
  }

  const initials = `${admin.first_name[0]}${admin.last_name[0]}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {admin.first_name} {admin.last_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {admin.department && (
              <p className="text-xs leading-none text-muted-foreground">
                {admin.department}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 focus:text-red-600"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

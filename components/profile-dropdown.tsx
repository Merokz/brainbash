"use client"

import { MouseEventHandler, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

interface ProfileDropdownProps {
  onHistoryClick: MouseEventHandler<HTMLDivElement>
  onProfileClick: MouseEventHandler<HTMLDivElement>
  onLogoutClick: MouseEventHandler<HTMLDivElement>
}

export default function ProfileDropdown({
  onHistoryClick,
  onProfileClick,
  onLogoutClick,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="relative inline-block"
      >
        {/* Hover target */}
        <div className="rounded-full cursor-pointer">
          <img src="/avatar.png" className="h-10 w-10 rounded-full" />
        </div>

        {/* Dropdown content */}
        <DropdownMenuContent
          className="absolute right-0 mt-2"
          sideOffset={4}
          align="end"
        >
          <DropdownMenuItem onClick={onProfileClick}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onHistoryClick}>
            History
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogoutClick}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  )
}

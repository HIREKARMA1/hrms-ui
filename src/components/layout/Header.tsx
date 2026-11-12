import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

import { useLayout } from './LayoutContext'
import { Sidebar } from './Sidebar'

export function Header() {
  const { mobileOpen, setMobileOpen } = useLayout()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search employees, documents, requests..."
            className="h-10 border-slate-200 bg-slate-50 pl-10 shadow-none focus-visible:bg-white"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:inline-flex"
            aria-label="Help"
          >
            <CircleHelp className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>RG</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-slate-900">
                    Rohith Goud
                  </p>
                  <p className="text-xs text-slate-500">HR Manager</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserRound className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[280px] border-0 bg-[#0b1220] p-0 text-white sm:max-w-[280px] [&>button]:text-white"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  )
}

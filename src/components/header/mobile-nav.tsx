import { Menu, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { menuItems } from "./menu-items";

export function MobileNav() {
  const navItems = menuItems.filter((item) => item.href !== "/contact");

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="ml-auto h-full w-80 rounded-none border-l border-border bg-background p-6 sm:rounded-none">
        <div className="mb-8 flex items-center justify-between">
          <a href="/" className="inline-flex items-center" aria-label="Steele Pythons home">
            <img
              src="/steelepythons-logo.png"
              alt="Steele Pythons"
              className="h-12 w-auto"
            />
          </a>

          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close navigation">
              <X className="size-5" />
            </Button>
          </DrawerClose>
        </div>

        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-2 text-base font-medium hover:bg-muted hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <a href="/contact" className="w-full">
            <Button className="w-full">Contact Us</Button>
          </a>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";
import * as React from "react";
// components
import { VerticalNavLink } from "./vertical-nav-link";
import {
  BroadcastIcon,
  GearIcon,
  PaintbrushIcon
} from "@primer/octicons-react";
import { clsx } from "~/lib/shared/utils.shared";

export type SettingsVerticalNavlistProps = {
  className?: string;
};

export function SettingsVerticalNavlist({
  className
}: SettingsVerticalNavlistProps) {
  return (
    <aside className={clsx(className)}>
      <nav className="sticky top-10">
        <ul className="flex w-full flex-col gap-1">
          <li>
            <VerticalNavLink href="/settings/account" icon={GearIcon}>
              Account
            </VerticalNavLink>
          </li>
          <li>
            <VerticalNavLink href="/settings/appearance" icon={PaintbrushIcon}>
              Appearance
            </VerticalNavLink>
          </li>
          <li>
            <VerticalNavLink href="/settings/sessions" icon={BroadcastIcon}>
              Sesssions
            </VerticalNavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

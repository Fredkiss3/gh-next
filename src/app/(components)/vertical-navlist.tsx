"use client";
import * as React from "react";
// components
import { VerticalNavLink } from "./vertical-nav-link";
import { GearIcon, PaintbrushIcon } from "@primer/octicons-react";

export type VerticalNavlistProps = {
  className?: string;
};

export function VerticalNavlist({ className }: VerticalNavlistProps) {
  return (
    <aside className={className}>
      <nav>
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
        </ul>
      </nav>
    </aside>
  );
}

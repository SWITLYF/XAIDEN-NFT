"use client";

import { WalletButton } from "../solana/solana-provider";
import * as React from "react";
import { ReactNode, Suspense, useEffect, useRef } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountChecker } from "../account/account-ui";
import {
  ClusterChecker,
  ClusterUiSelect,
  ExplorerLink,
} from "../cluster/cluster-ui";
import toast, { Toaster } from "react-hot-toast";

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();

  return (
    
<div className="h-full flex flex-col">
  <div className="navbar bg-base-300 text-neutral-content flex-col md:flex-row space-y-2 md:space-y-0 shadow-lg transition-transform duration-300 ease-in-out transform hover:-translate-y-1">
    <div className="flex-1">
      <Link className="btn btn-ghost normal-case text-xl" href="/">
        <p className="text-3xl text-pink-300 font-bold">XAIDEN-NFT</p>
      </Link>
      <ul className="menu menu-horizontal px-1 space-x-2">
        {links.map(({ label, path }) => (
          <li key={path}>
            <Link
              className={`text-lg font-bold transition-colors duration-300 ${pathname.startsWith(path) ? "text-blue-400" : "text-gray-300 hover:text-blue-400"}`}
              href={path}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
    <div className="flex-none space-x-2">
      <WalletButton />
      <ClusterUiSelect />
    </div>
  </div>

  <ClusterChecker>
    <AccountChecker />
  </ClusterChecker>

  <div className="flex-grow mx-4 lg:mx-auto">
    <Suspense
      fallback={
        <div className="text-center my-32">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      {children}
    </Suspense>
    <Toaster position="bottom-right" />
  </div>

  <footer className="footer footer-center p-4 bg-base-300 text-base-content shadow-inner transition-transform duration-300 ease-in-out transform hover:scale-105">
    <aside>
      <p>
        developed by{" "}
        <a
          href="http://github.com/SWITLYF"
          className="text-blue-200 hover:underline"
        >
          XAIDEN
        </a>
      </p>
    </aside>
  </footer>
</div>
    
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || "Save"}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === "string" ? (
            <h1 className="text-5xl font-bold text-pink-300">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === "string" ? (
            <p className="py-6 text-pink-200">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={"text-center"}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={"View Transaction"}
          className="btn btn-xs btn-primary"
        />
      </div>
    );
  };
}

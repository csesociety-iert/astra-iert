"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, FileText, LogOut, UserRound, X } from "lucide-react";

type ProfileDropdownProps = {
  name: string;
  accountType: string;
  avatarUrl?: string | null;
  onSignOut: () => void | Promise<void>;
  floating?: boolean;
};

export function ProfileDropdown({
  name,
  accountType,
  avatarUrl,
  onSignOut,
  floating = false,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<CSSProperties>();

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    if (!open && !photoOpen) return;

    function positionMenu() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({
        top: `${rect.bottom + 7}px`,
        right: `${Math.max(16, window.innerWidth - rect.right)}px`,
      });
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !dropdownRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setPhotoOpen(false);
      }
    }

    if (open) {
      positionMenu();
      document.addEventListener("pointerdown", handlePointerDown, true);
      window.addEventListener("resize", positionMenu);
      window.addEventListener("scroll", positionMenu, true);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, photoOpen]);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className={`profile-dropdown${floating ? " profile-dropdown-floating" : ""}`} ref={dropdownRef}>
      <button
        className="profile-dropdown-trigger"
        type="button"
        aria-label={`Profile menu for ${name}`}
        aria-expanded={open}
        aria-controls="profile-dropdown-menu"
        ref={triggerRef}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="dashboard-avatar" aria-hidden="true">
          {avatarUrl && !avatarLoadFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" onError={() => setAvatarLoadFailed(true)} />
          ) : initials}
        </span>
        <ChevronDown className="profile-dropdown-chevron" size={15} aria-hidden="true" />
      </button>
      {open && menuPosition && createPortal(
        <div className="profile-dropdown-menu" id="profile-dropdown-menu" ref={menuRef} style={menuPosition}>
          <div className="profile-dropdown-summary">
            <span className="dashboard-avatar profile-dropdown-summary-avatar" aria-hidden="true">
              {avatarUrl && !avatarLoadFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" onError={() => setAvatarLoadFailed(true)} />
              ) : initials}
            </span>
            <span className="profile-dropdown-identity">
              <strong>{name}</strong>
              <small>{accountType}</small>
            </span>
          </div>
          <div className="profile-dropdown-actions">
            {avatarUrl && !avatarLoadFailed && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPhotoOpen(true);
                }}
              >
                <UserRound size={17} aria-hidden="true" />
                View photo
              </button>
            )}
            <a href="/profile" onClick={() => setOpen(false)}>
              <UserRound size={17} aria-hidden="true" />
              View profile
            </a>
            <a href="/submissions" onClick={() => setOpen(false)}>
              <FileText size={17} aria-hidden="true" />
              My submissions
            </a>
            <button
              type="button"
              className="profile-dropdown-signout"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                try {
                  await onSignOut();
                } finally {
                  setSigningOut(false);
                }
              }}
            >
              <LogOut size={17} aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>,
        document.body,
      )}
      {photoOpen && avatarUrl && createPortal(
        <div
          className="profile-photo-lightbox"
          role="presentation"
          onClick={() => setPhotoOpen(false)}
        >
          <section
            className="profile-photo-lightbox-content"
            role="dialog"
            aria-modal="true"
            aria-label={`${name}'s profile photo`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="profile-photo-lightbox-close"
              aria-label="Close enlarged photo"
              onClick={() => setPhotoOpen(false)}
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt={`${name}'s profile`} />
            <p>{name}</p>
          </section>
        </div>,
        document.body,
      )}
    </div>
  );
}

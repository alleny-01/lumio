import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { LMSContext } from "@/contexts/LMSContext";
import { signOut as signOutRequest } from "@/shared/api/auth";
import { mainNavItems } from "@/shared/constants/constants";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

function Sidebar({
  isCollapsed,
  isMobileOpen,
  onToggleCollapsed,
  onCloseMobile,
}: SidebarProps): React.JSX.Element {
  const { session, userProfile, setSession, isLoading, setIsLoading, setAuthError } =
    useContext(LMSContext);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const userEmail = session?.user?.email ?? "";
  const userMeta = session?.user?.user_metadata;

  const firstName = userProfile?.first_name ?? userMeta?.first_name ?? userMeta?.given_name ?? "";
  const lastName = userProfile?.last_name ?? userMeta?.last_name ?? userMeta?.family_name ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const userName =
    fullName ||
    userMeta?.full_name ||
    userMeta?.name ||
    userEmail.split("@")[0] ||
    "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarUrl =
    userProfile?.avatar_url ||
    userMeta?.avatar_url ||
    userMeta?.picture ||
    "";

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await signOutRequest();
      if (error) {
        setAuthError(error.message);
        return;
      }
      setSession(null);
      navigate("/signin", { replace: true });
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    } finally {
      setIsLoading(false);
      setIsLogoutModalOpen(false);
      onCloseMobile();
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/35 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col border-r border-outline-variant/30 bg-surface-container-lowest shadow-[8px_0_30px_-28px_rgba(15,23,42,0.45)] transition-[width,transform] duration-300 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-14 items-center justify-between border-b border-outline-variant/30 px-3">
          <div
            className={cn(
              "min-w-0 items-center gap-2 flex",
              isCollapsed && "md:hidden",
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] uppercase font-medium tracking-wide text-on-surface">
                Lumio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="hidden size-8 items-center justify-center rounded-sm border-2 border-outline-variant text-outline transition-colors hover:bg-surface-container hover:text-on-surface md:inline-flex"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={onToggleCollapsed}
            >
              {isCollapsed ? (
                <ChevronsRight size={16} strokeWidth={1} />
              ) : (
                <ChevronsLeft size={16} strokeWidth={1} />
              )}
            </button>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-sm text-outline transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
              aria-label="Close navigation"
              onClick={onCloseMobile}
            >
              <X size={17} strokeWidth={1.4} />
            </button>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-4">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "group relative flex h-10 items-center gap-3 rounded-sm px-3 text-[12px] font-light tracking-wide transition-colors hover:bg-surface-container hover:text-on-surface",
                  isActive && "bg-surface-container text-on-surface",
                  isCollapsed && "md:justify-center md:px-0",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary opacity-0 transition-opacity",
                      isActive && "opacity-100",
                    )}
                  />
                  <span
                    className={cn(
                      "flex shrink-0 text-on-surface-variant transition-colors group-hover:text-on-surface",
                      isActive && "text-primary",
                    )}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span
                    className={cn("min-w-0 truncate", isCollapsed && "md:hidden")}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-outline-variant/30 p-2">
          <div
            className={cn(
              "mb-2 flex items-center gap-3 rounded-sm px-2 py-2",
              isCollapsed && "md:justify-center md:px-0",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/40 bg-primary-fixed text-[11px] font-medium text-on-primary-fixed">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                userInitial
              )}
            </div>
            <div className={cn("min-w-0", isCollapsed && "md:hidden")}>
              <p className="truncate text-[12px] font-medium text-on-surface">
                {userName}
              </p>
              <p className="truncate text-[10px] font-light">
                {userEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-sm px-3 text-[12px] font-light text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface",
              isCollapsed && "md:justify-center md:px-0",
            )}
          >
            <LogOut size={17} strokeWidth={1.3} />
            <span className={cn(isCollapsed && "md:hidden")}>Log out</span>
          </button>
        </div>
      </aside>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-sm border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-2xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-sm bg-primary/10">
              <LogOut size={17} strokeWidth={1.3} />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-sm font-medium text-on-surface">Log out</h2>
              <p className="mt-2 text-xs font-light leading-6 text-on-surface-variant">
                Your current session will end and you will return to sign in.
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="lg"
                className="flex-1 gap-2"
                onClick={signOut}
                disabled={isLoading}
              >
                {isLoading && <Spinner />}
                {isLoading ? "Logging out..." : "Log out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

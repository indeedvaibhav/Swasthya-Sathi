import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

const CountCtx = createContext<{ register: () => () => void } | null>(null);

export function PrimaryCtaScope({ children }: { children: ReactNode }) {
  const count = useRef(0);

  useEffect(() => {
    if (count.current > 1) {
      console.warn(
        `[eSwasthya] ${count.current} primary CTAs on this screen. Patient screens allow exactly one.`,
      );
    }
  });

  const api = {
    register() {
      count.current += 1;
      return () => {
        count.current -= 1;
      };
    },
  };

  return <CountCtx.Provider value={api}>{children}</CountCtx.Provider>;
}

export function usePrimaryCtaRegistration(active: boolean) {
  const ctx = useContext(CountCtx);
  useEffect(() => {
    if (!active || !ctx) return;
    return ctx.register();
  }, [active, ctx]);
}

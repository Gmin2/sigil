import { useCallback, useState } from "react";
import { connect, disconnect, getLocalStorage } from "@stacks/connect";

export function stxAddress(): string | null {
  return getLocalStorage()?.addresses?.stx?.[0]?.address ?? null;
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(() => stxAddress());

  const open = useCallback(async () => {
    try {
      await connect();
    } catch (e) {
      // a misbehaving wallet extension (e.g. an un-onboarded one) can reject
      // during discovery; don't let it wedge the flow, just read what we got.
      console.warn("connect:", e);
    }
    setAddress(stxAddress());
  }, []);

  const close = useCallback(() => {
    disconnect();
    setAddress(null);
  }, []);

  return { address, connected: !!address, connect: open, disconnect: close };
}

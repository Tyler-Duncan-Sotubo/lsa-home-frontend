// src/config/RuntimeConfigHydrator.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { hydrateRuntimeConfig } from "@/store/runtimeConfigSlice";
import { StorefrontConfigV1 } from "../types/types";
import { buildRuntimeConfigPayload } from "./build-runtime-config-payload";

export function RuntimeConfigHydrator({
  config,
}: {
  config: StorefrontConfigV1;
}) {
  const dispatch = useAppDispatch();

  // The store is already preloaded with this same config synchronously
  // (see makeStore/AppProviders), so this effect is now just a safety net
  // for cases where `config` changes after the initial mount — it no
  // longer needs to run for the very first render to be correct.
  useEffect(() => {
    if (!config) return;
    dispatch(hydrateRuntimeConfig(buildRuntimeConfigPayload(config)));
  }, [dispatch, config]);

  return null;
}

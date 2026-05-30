"use client";

import * as React from "react";

export function useCoarsePointer() {
  const [isCoarse, setIsCoarse] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isCoarse;
}

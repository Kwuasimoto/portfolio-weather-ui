import { Component } from "solid-js";

export const Watermark: Component = () => {
  return (
    <div class="fixed bottom-4 left-4 z-50 pointer-events-none">
      <div class="rounded-md bg-black/20 backdrop-blur-sm px-3 py-1.5 text-xs text-white/80 font-medium tracking-wide">
        By Kwuasimoto
      </div>
    </div>
  );
};
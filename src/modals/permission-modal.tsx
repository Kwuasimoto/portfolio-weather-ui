import { Component } from "solid-js";

export type PermissionModalProps = {
  onAccept: () => void;
  onDecline: () => void;
};

export const PermissionModal: Component<PermissionModalProps> = ({
  onAccept,
  onDecline,
}) => {
  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="mx-4 max-w-md rounded-lg bg-white p-6">
        <div class="mb-4 flex justify-between gap-3">
          <h2 class="text-xl font-semibold">Kwuasi News</h2>
          <h2 class="text-xl font-semibold">Location access</h2>
        </div>
        <p class="mb-6 text-gray-600">
          This app would like to access your location to show weather data for
          your area. We'll use your IP address to determine your approximate
          location.
        </p>
        <div class="flex justify-end gap-4">
          <button
            onClick={onDecline}
            class="w-30 rounded-sm bg-blue-500 p-1 px-2 text-sm font-semibold hover:bg-blue-400"
          >
            Use Default
          </button>
          <button
            onClick={onAccept}
            class="w-30 rounded-sm bg-blue-500 p-1 px-2 text-sm font-semibold hover:bg-blue-400"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};

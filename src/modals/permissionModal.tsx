import { PermissionModalProps } from "@types";
import { Component } from "solid-js";

export const PermissionModal: Component<PermissionModalProps> = ({
  onAccept,
  onDecline,
}) => {
  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      Yeet
    </div>
  );
};

/* @refresh reload */
import "./index.css";

import { render } from "solid-js/web";

import App from "./app";
import { Router } from "@solidjs/router";
import { routes } from "./routes";

const root = document.getElementById("root");

if (!root || !(root instanceof HTMLElement)) {
  throw new Error(
    "Failed to build root element, returned null or not an instance of HTMLElement.",
  );
}

render(
  () => <Router root={(props) => <App>{props.children}</App>}>{routes}</Router>,
  root,
);

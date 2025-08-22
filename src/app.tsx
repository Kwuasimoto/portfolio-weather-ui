import { JSXElement, Suspense } from "solid-js";

const App = (props: { children: JSXElement }) => {
  return (
    <>
      <main class="relative h-dvh min-h-full w-full">
        <Suspense>{props.children}</Suspense>
      </main>
    </>
  );
};

export default App;

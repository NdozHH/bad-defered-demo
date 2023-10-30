
import { ChakraProvider, Box, Heading } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLocation,
} from "@remix-run/react";
import { useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { ClientOnly } from "remix-utils";
import { ClientStyleContext } from "./context";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
});

export const Head = withEmotionCache((_props, emotionCache) => {
  const clientStyleData = useContext(ClientStyleContext);

  // Only executed on client
  useEffect(() => {
    // re-link sheet container
    emotionCache.sheet.container = document.head;
    // re-inject tags
    const tags = emotionCache.sheet.tags;
    emotionCache.sheet.flush();
    tags.forEach((tag) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any -- Copied from https://chakra-ui.com/getting-started/remix-guide
      (emotionCache.sheet as any)._insertTag(tag);
    });
    // reset cache to reapply global styles
    clientStyleData?.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Copied from https://chakra-ui.com/getting-started/remix-guide#2-provider-setup
  }, []);

  return (
    <>
      <Meta />
      <Links />
    </>
  );
});

function Document({ children,  }) {
  const location = useLocation();

  useEffect(() => {
    console.log("Page View", { path: location.pathname });
  }, [location]);

  return (
    <>
      <ClientOnly>{() => createPortal(<Head />, document.head)}</ClientOnly>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/defer">Defer</NavLink>
      </nav>
      <ChakraProvider>{children}</ChakraProvider>
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </>
  );
}

export default function Root() {
  return (
    <Document>
        <Outlet />
    </Document>
  );
}
// How ChakraProvider should be used on CatchBoundary
export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <ChakraProvider>
        <Box>
          <Heading as="h1" bg="purple.600">
            [CatchBoundary]: {caught.status} {caught.statusText}
          </Heading>
        </Box>
      </ChakraProvider>
    </Document>
  );
}

// How ChakraProvider should be used on ErrorBoundary
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Error!">
      <ChakraProvider>
        <Box>
          <Heading as="h1" bg="blue.500">
            [ErrorBoundary]: There was an error: {error.message}
          </Heading>
        </Box>
      </ChakraProvider>
    </Document>
  );
}






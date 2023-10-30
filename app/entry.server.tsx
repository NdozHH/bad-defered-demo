import { PassThrough } from "stream";

import { CacheProvider, CacheProvider as EmotionCacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream, renderToString } from "react-dom/server";
import createEmotionCache from "./emotion-cache";
import { Head } from "./root";

const ABORT_DELAY = 5000;


export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
    : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function handleBrowserRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  const emotionCache = createEmotionCache();
  const emotionServer = createEmotionServer(emotionCache);

  const html = renderToString(
    <EmotionCacheProvider value={emotionCache}>
      <RemixServer context={remixContext} url={request.url} />
    </EmotionCacheProvider>
  );

  const emotionChunks = emotionServer.extractCriticalToChunks(html);
  const emotionCss = emotionServer.constructStyleTagsFromChunks(emotionChunks);

  // swap out default component with <Head>
  const defaultRoot = remixContext.routeModules.root;
  remixContext.routeModules.root = {
    ...defaultRoot,
    default: Head,
  };

  const head = renderToString(<RemixServer context={remixContext} url={request.url} />);

  // restore the default root component
  remixContext.routeModules.root = defaultRoot;

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <EmotionCacheProvider value={emotionCache}>
        <RemixServer context={remixContext} url={request.url} />
      </EmotionCacheProvider>,
      {
        onShellReady: async () => {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          body.write(
            `<!DOCTYPE html><html lang="en"><head><!--start head-->${head}<!--end head-->${emotionCss}</head><body><div id="root">`
          );
          pipe(body);
          await new Promise((res) => setTimeout(() => res('yes'), 2000))
          body.end("</div></body></html>");
        },
        onShellError: (error) => {
          reject(error);
          console.error("onShellError", error);
        },
        onError: (error) => {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBotRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  const emotionCache = createEmotionCache();
  const emotionServer = createEmotionServer(emotionCache);

  const html = renderToString(
    <EmotionCacheProvider value={emotionCache}>
      <RemixServer context={remixContext} url={request.url} />
    </EmotionCacheProvider>
  );

  const emotionChunks = emotionServer.extractCriticalToChunks(html);
  const emotionCss = emotionServer.constructStyleTagsFromChunks(emotionChunks);

  // swap out default component with <Head>
  const defaultRoot = remixContext.routeModules.root;
  remixContext.routeModules.root = {
    ...defaultRoot,
    default: Head,
  };

  const head = renderToString(<RemixServer context={remixContext} url={request.url} />);

  // restore the default root component
  remixContext.routeModules.root = defaultRoot;

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <EmotionCacheProvider value={emotionCache}>
        <RemixServer context={remixContext} url={request.url} />
      </EmotionCacheProvider>,
      {
        onAllReady: () => {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          body.write(
            `<!DOCTYPE html><html lang="en"><head><!--start head-->${head}<!--end head-->${emotionCss}</head><body><div id="root">`
          );
          pipe(body);
          body.end("</div></body></html>");
        },
        onShellError: (error) => {
          reject(error);
        },
        onError: (error) => {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
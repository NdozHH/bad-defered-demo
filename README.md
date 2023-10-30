# Chakra UI Example

This a very simple setup of Chakra UI with Remix to use React 18 streaming with Remix's defer. The main objective is to use defer with CSS-in-Js libraries like Chakra or MUI.

## Note

This is using the `next` tag of react and react-dom to remove hydration errors, but it's the same with the `latest` React 18.2.0

## Problem

The first navigation to `/defer` route seems to work correctly but if the page is refresed, the promise returned by the loader doesn't resolve and the following error appears on the terminal

```
Error: The destination stream closed early.
    at PassThrough.<anonymous> (M:\Personal\Documents\examples\chakra-ui\node_modules\react-dom\cjs\react-dom-server.node.development.js:11109:20)
    at PassThrough.emit (node:events:525:35)
    at emitCloseNT (node:internal/streams/destroy:132:10)
    at processTicksAndRejections (node:internal/process/task_queues:81:21)
```

## Development

- Install dependencies

  ```sh
  npm run setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

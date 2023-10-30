import { Box } from "@chakra-ui/react";
import { defer, type LoaderArgs } from "@remix-run/node"; // or cloudflare/deno
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export function meta() {
  return {
    title: "Defer page",
    description: "Let's defer some data!",
  };
}

export function loader({ params }: LoaderArgs) {
  return defer({
    fastData: { message: "This is fast data" },
    slowData: new Promise((resolve) => {
      setTimeout(() => {
      resolve({ message: "This is slow data" })
    }, 3000)
  })
  });
}


export default function DeferRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      backgroundColor: 'lightblue'
    }}>
      <h1>Defer Route</h1>
      <p>{data.fastData.message}</p>
      <Suspense fallback={<p>Loading slow data...</p>}>
        <Await
          resolve={data.slowData}
          errorElement={<p>Error loading slow data!</p>}
        >
          {({ message }) => <p>{message}</p>}
        </Await>
      </Suspense>
    </Box >
  );
}
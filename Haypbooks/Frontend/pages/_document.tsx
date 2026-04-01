import { Html, Head, Main, NextScript } from 'next/document'

// Required pages/_document for the pages-router fallback (_error/404/500).
// This allows <Html> to be used in the pages router error page context.
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// Minimal pages router error page — prevents the default next/dist/pages/_error.js
// from being used, which imports <Html> in a way that fails during build.
function Error({ statusCode }: { statusCode?: number }) {
  return (
    <p>
      {statusCode
        ? `A ${statusCode} error occurred on server`
        : 'An error occurred on client'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }: { res?: { statusCode: number }; err?: { statusCode: number } }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error

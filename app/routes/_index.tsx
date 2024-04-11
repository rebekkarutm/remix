// index page (with the _) tells Remix to use this page when using the parent route's exact path

export default function Index() {
    return (
        <p id="index-page">
            This is a demo for Remix.
            <br />
            Check out{' '}
            <a href="https://remix.run">the docs at remix.run</a>
        </p>
    )
}
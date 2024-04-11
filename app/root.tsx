import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@vercel/remix";
import { json, redirect, } from "@vercel/remix";
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect } from "react";

import './app.css'
import { createEmptyContact, getContacts } from "./data";

// using an action function to create a new, empty, contact
// clicking the 'new' button will make the form POST to the root route action
// <Form> sends the request to the action function with fetch
// the method in the <Form> is POST so the data is revalidated after 'action' finishes
export const action = async () => {
  const contact = await createEmptyContact()
  // when an empty/new contact is created, the page redirects to the edit contact page
  return redirect(`/contacts/${contact.id}/edit`)
}

// connecting the styles to the page
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: './app.css' }
]

// loading all contacts as json data
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  // making the url be a new URL request
  const url = new URL(request.url)
  // making q be the url and search param (the 'q')
  const q = url.searchParams.get('q')
  // using getContacts to get contacts matching the q
  const contacts = await getContacts(q)
  // return the matching contacts and the search query
  return json({ contacts, q })
}

export default function App() {
  // returning the json data from the loader (in this case the contacts nad the search query)
  // typescript safe, stating contacts and q are types of loader
  const { contacts, q } = useLoaderData<typeof loader>()
  // useNavigation returns the current state of navigation; idle, loading, or submitting
  const navigation = useNavigation()
  // useSubmit enables the form to be submitted
  const submit = useSubmit()
  // when idle, navigation.location is undefined because you're not navigating to anything
  // when user navigates, the navigation.location populates with the next location
  const searching =
    navigation.location &&
    // location.search checks if the user is searching
    new URLSearchParams(navigation.location.search).has(
      'q'
    )

  // making sure the searchField input (search query) is in sync with the URL
  useEffect(() => {
    const searchField = document.getElementById('q')
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || ''
    }
  }, [q])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {/* all links, including the stylesheet */}
        <Links />
      </head>
      <body>
        {/* the whole sidebar of contacts */}
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            {/* the search window with q = query */}
            {/* form fetches data on the client side instead of a new document request */}
            <Form
              id="search-form"
              // as you type the form automatically updates (changes causes a submit)
              // first search if the query is null
              // if not first search, replace entry in browser history instead of creating a new one
              onChange={(event) => {
                const isFirstSearch = q === null
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                })
              }}
              role="search"
            >
              <input
                id="q"
                aria-label="Search contacts"
                // if a search is loading, then display the loading style, else null
                className={searching ? 'loading' : ''}
                // default value is the search query if there is one, else null
                defaultValue={q || ""}
                placeholder="Search"
                type="search"
                name="q"
              />
              {/* the search spinner icon, hidden when no searching */}
              <div
                id="search-spinner"
                aria-hidden
                hidden={!searching}
              />
            </Form>
            {/* new contact button */}
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {/* is there contact length? return the contacts, map through them */}
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    {/* Link to = browser updates on client side instead of
                    requesting another document from the server which takes a long time
                    and is unnecessary */}
                    <NavLink
                      // if the link is clicked on, the navlink is active (URL matches the NavLink to)
                      className={({ isActive, isPending }) =>
                        isActive
                          ? 'active'
                          : isPending
                          ? 'pending'
                          : ''
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {/* is there a first or last name? display it, else say 'no name' */}
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{' '}
                      {/* is the favorite true? show star, else null */}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              // if no contacts, say that
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        {/* outlet is used to make child routes render inside the parent
        so we have the sidebar and then the rest of the screen
        where child routes (like contact details) are rendered */}
        <div
          // if navigation state is loading and there's no search loading, display loading style, else null
          className={
            navigation.state === 'loading' && !searching
              ? 'loading'
              : ''
          }
          id="detail"
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
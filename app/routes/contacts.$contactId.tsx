import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
} from "@vercel/remix";
import { json } from "@remix-run/react";
import {
    Form,
    useFetcher,
    useLoaderData,
} from "@remix-run/react";
import type { FunctionComponent } from "react";
import invariant from "tiny-invariant";

import type { ContactRecord } from "~/data"; // the fake database
import { getContact, updateContact } from "~/data"; // fetching the relevant details for a contact

// 
export const action = async ({
    params,
    request,
}: ActionFunctionArgs) => {
    // error throwing if there's no contactId
    invariant(params.contactId, 'Missing contactId param')
    // when a form is submitted the request body will be the formData (each field in the form)
    // Remix sends the request and the formData to the action function with fetch
    // request.formData reads the request body and returns the info in formData object
    const formData = await request.formData()
    // update contact with favorite being true
    return updateContact(params.contactId, {
        favorite: formData.get('favorite') === 'true'
    })
}

// creating the loader = contact info as json data
export const loader = async ({
    params,
// saying the params are arguments for the loader function
} : LoaderFunctionArgs) => {
    // invariant makes sure the assertion is true, if there's no contactId it throws an error
    invariant(params.contactId, 'Missing contactId param')
    // create a contact, await the info from the getContact with the contactId
    const contact = await getContact(params.contactId)
    // 404 error if there is no contact found (maybe no contact with that Id)
    if (!contact) {
        throw new Response('Not found', { status: 404 })
    }
    // return contact info as json data
    return json({ contact })
}

export default function Contact() {
    // loading the contact info from the json loader data
    const { contact } = useLoaderData<typeof loader>()

    return (
        <div id="contact">
            <div>
                {/* image avatar calling from contact info, with alt as name of contact */}
                <img
                    alt={`${contact.first} ${contact.last} avatar`}
                    key={contact.avatar}
                    src={contact.avatar}
                />
            </div>

            <div>
                <h1>
                    {/* is there a first or last name? publish them. else, no name */}
                    {contact.first || contact.last ? (
                        <>
                            {contact.first} {contact.last}
                        </>
                    ) : (
                        <i>No Name</i>
                    )}{' '}
                    <Favorite contact={contact} />
                </h1>

                {/* if twitter handle, link to twitter, else null */}
                {contact.twitter ? (
                    <p>
                        <a
                            href={`https://twitter.com/${contact.twitter}`}
                        >
                            {contact.twitter}
                        </a>
                    </p>
                ) : null}

                {/* if contact notes, publish them. else null */}
                {contact.notes ? <p>{contact.notes}</p> : null}

                <div>
                    {/* button to edit contact */}
                    <Form action='edit'>
                        <button type="submit">Edit</button>
                    </Form>

                    {/* button to delete contact with a post request */}
                    <Form
                        action="destroy"
                        method="post"
                        onSubmit={(event) => {
                            const response = confirm(
                                'Please confirm you want to delete this record.'
                            )
                            {/* if no response, do not do the default action (destroy) */}
                            if (!response) {
                                event.preventDefault()
                            }
                        }}
                    >
                        <button type="submit">Delete</button>
                    </Form>
                </div>
            </div>
        </div>
    )
}

const Favorite: FunctionComponent<{
    contact: Pick<ContactRecord, 'favorite'>
}> = ({ contact }) => {
    // useFecther interacts with loaders and actions without navigating to a new page
    const fetcher = useFetcher()
    // checking if the contact has favorite true or false by fetching the formData
    // if favorite is true, display star, if not, display outlined star
    const favorite = fetcher.formData
        ? fetcher.formData.get('favorite') === 'true'
        : contact.favorite

    return (
        // updating info so post method
        <fetcher.Form method="post">
            <button
                aria-label={
                    // if favorite is true or false this is what screen readers say
                    favorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                }
                name='favorite'
                value={favorite ? 'false' : 'true'}
            >
                {/* if favorite is true, full star. if false, outlined star */}
                {favorite ? '★' : '☆'}
            </button>
        </fetcher.Form>
    )
}
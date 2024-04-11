// the _ after contactId means the page doesn't nest inside app/routes/contacts
// layout is app/root.tsx (instead of app/routes/contacts.tsx) and link is /contacts/edit

import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
} from "@vercel/remix";
import { json, redirect, } from "@vercel/remix";
import {
    Form,
    useLoaderData,
    useNavigate,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact, updateContact, } from "~/data";

// calling an action to update the data
// Remix automatically revalidates data after the action call, automatic update of data!
export const action = async ({
    params,
    request,
// letting typescript know that these are arguments for the action function
}: ActionFunctionArgs) => {
    // invariant throws an error if the contactId param is missing
    invariant(params.contactId, 'Missing contactId param')
    // when a form is submitted the request body will be the formData (each field in the form)
    // Remix sends the request and the formData to the action function with fetch
    // request.formData reads the request body and returns the info in formData object
    const formData = await request.formData()
    // Object.fromEntries collects all the form fields into an object
    const updates = Object.fromEntries(formData)
    await updateContact(params.contactId, updates)
    // redirect tells the app to change locations
    // javascript redirect is client side so it holds onto things like scroll position and component state
    return redirect(`/contacts/${params.contactId}`)
}

// function to load the contact info
export const loader = async ({
    params,
// typescript needs to now it's an argument for the loader function
}: LoaderFunctionArgs) => {
    // invariant makes sure the statement is true, if not it throws a custom error
    // here we want to make sure the parameter of contactId is present
    invariant(params.contactId, 'Missing contactId param')
    // contact gets the info via the getContact function and the contactId
    const contact = await getContact(params.contactId)
    // if no contact throw a 404
    if (!contact) {
        throw new Response('Not found', { status: 404 })
    }
    // return the contact info in a json form
    return json({ contact })
}

export default function EditContact() {
    // the contact is the data from the loader
    const { contact } = useLoaderData<typeof loader>()
    // useNavigate changes the location (change a page)
    const navigate = useNavigate()

    return (
        <Form key={contact.id} id="contact-form" method="post">
            <p>
                {/* first and last name of contact */}
                <span>Name</span>
                <input
                    defaultValue={contact.first}
                    aria-label="First name"
                    name="first"
                    type="text"
                    placeholder="First"
                />
                <input
                    aria-label="Last name"
                    defaultValue={contact.last}
                    name="Last"
                    placeholder="Last"
                    type="text"
                />
            </p>
            <label>
                {/* twitter handle */}
                <span>Twitter</span>
                <input
                    defaultValue={contact.twitter}
                    name="twitter"
                    placeholder="@jack"
                    type="text"
                />
            </label>
            <label>
                {/* avatar image link */}
                <span>Avatar URL</span>
                <input
                    defaultValue={contact.avatar}
                    name="avatar"
                    placeholder="https://example.com/avatar.jpg"
                    type="text"
                />
            </label>
            <label>
                {/* notes about contact */}
                <span>Notes</span>
                <textarea
                    defaultValue={contact.notes}
                    name="notes"
                    rows={6}
                />
            </label>
            <p>
                <button type="submit">Save</button>
                {/* onClick activates the navigation, going back 1 page in browser history */}
                <button onClick={() => navigate(-1)} type="button">
                    Cancel
                </button>
            </p>
        </Form>
    )
}
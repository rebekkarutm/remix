// in app/routes/contacts.$contactId.tsx there is a <Form> with the action="destroy"
// the action matches the route to this page and sends the request to this page

import type { ActionFunctionArgs } from "@vercel/remix";
import { redirect } from "@vercel/remix";
import invariant from "tiny-invariant";

import { deleteContact } from "~/data";

// action to delete the contact and redirect
// after the action and redirect, Remix calls all the loaders (revalidating the data)
export const action = async ({
    params,
}: ActionFunctionArgs) => {
    // invariant to error handle if there is no contactId
    invariant(params.contactId, 'Missing contactId param')
    // wait for the deleteContact function that deletes according to the contactId param
    await deleteContact(params.contactId)
    // redirects to the index page
    return redirect(`/`)
}
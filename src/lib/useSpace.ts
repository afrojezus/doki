import Router from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

export default function useUser({
    redirectTo = "",
    redirectIfFound = false,
} = {}) {
    const { data: space, mutate: mutateSpace } = useSWR("/api/space");

    useEffect(() => {
        // if no redirect needed, just return (example: already on /dashboard)
        // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
        if (!redirectTo || !space) return;

        if (
            // If redirectTo is set, redirect if the user was not found.
            (redirectTo && !redirectIfFound && !space?.isLoggedIn) ||
            // If redirectIfFound is also set, redirect if the user was found
            (redirectIfFound && space?.isLoggedIn)
        ) {
            Router.push(redirectTo);
        }
    }, [space, redirectIfFound, redirectTo]);

    return { space, mutateSpace };
}

import { Space } from '@server/models';
import type { IronSessionOptions } from 'iron-session';
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import { NextApiHandler, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export const sessionOptions: IronSessionOptions = {
    password: process.env.SPACE_SECRET as string,
    cookieName: 'doki-space',
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
};

export function withSessionRoute(handler: NextApiHandler) {
    return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr<
    P extends { [key: string]: unknown; } = { [key: string]: unknown; },
    >(
        handler: (
            context: GetServerSidePropsContext,
        ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
    return withIronSessionSsr(handler, sessionOptions);
}

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
    interface IronSessionData {
        space?: Space;
    }
}
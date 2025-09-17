import { NextApiRequest, NextApiResponse } from 'next';
import { createAppExtension, getAppExtensions, removeDuplicateAppExtensions } from '@lib/appExtensions';
import db from '@lib/db';
import { encodePayload, getBCVerify, setSession } from '../../lib/auth';
import { ensureWebhookExists } from '../../lib/webhooks';

const buildRedirectUrl = (url: string, encodedContext: string) => {
    const [path, query = ''] = url.split('?');
    const queryParams = new URLSearchParams(
        `context=${encodedContext}&${query}`
    );

    return `${path}?${queryParams}`;
};

export default async function load(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Verify when app loaded (launch)
        const session = await getBCVerify(req.query);
        const encodedContext = encodePayload(session); // Signed JWT to validate/ prevent tampering

        const { sub } = session;
        const storeHash = sub?.split('/')[1] || '';

        const accessToken = await db.getStoreToken(storeHash);

        await setSession(session);

        /**
         * For stores that do not have app extensions installed yet, create app extensions when app is
         * loaded
         */

        const isAppExtensionsScopeEnabled = await db.hasAppExtensionsScope(storeHash);

        if (!isAppExtensionsScopeEnabled) {
          console.warn(
            "WARNING: App extensions scope is not enabled yet. To register app extensions update the scope in Developer Portal: https://devtools.bigcommerce.com");
          
          return res.redirect(302, buildRedirectUrl(session.url, encodedContext));
        }

        const existingAppExtensions = await fetch(
            `https://${process.env.API_URL}/stores/${storeHash}/graphql`,
            {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'x-auth-token': accessToken,
                },
                body: JSON.stringify(getAppExtensions()),
            }
        );

        const { data } = await existingAppExtensions.json();

        const existingAppExtensionIds = data?.store?.appExtensions?.edges;

        // Check if we already have our specific app extension installed
        // Look for app extensions with our specific URL pattern
        const hasOurAppExtension = existingAppExtensionIds?.some((edge: any) => 
            edge?.node?.url?.includes('/productAppExtension/')
        );

        // Clean up any duplicate app extensions first
        await removeDuplicateAppExtensions({ accessToken, storeHash });

        // Only create app extension if we don't already have one
        if (!hasOurAppExtension) {
          console.log('Creating app extension for store:', storeHash);
          await createAppExtension({ accessToken, storeHash });
        } else {
          console.log('App extension already exists for store:', storeHash);
        }

        // Ensure webhook exists for order events (safety check for existing installations)
        try {
            await ensureWebhookExists({ accessToken, storeHash });
        } catch (webhookError) {
            // Log webhook creation error but don't fail the app load
            console.error('Failed to ensure webhook exists during app load:', webhookError);
        }

        res.redirect(302, buildRedirectUrl(session.url, encodedContext));
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}

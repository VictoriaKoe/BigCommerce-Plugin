import { NextApiRequest, NextApiResponse } from 'next';
import { getBCVerify, removeDataStore } from '../../lib/auth';
import db from '../../lib/db';
import { listWebhooks, removeWebhook } from '../../lib/webhooks';

export default async function uninstall(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getBCVerify(req.query);
        const { context } = session;
        const storeHash = context?.split('/')[1] || '';

        // Get access token before removing store data
        const accessToken = await db.getStoreToken(storeHash);

        // Clean up webhooks before removing store data
        if (accessToken) {
            try {
                const webhooks = await listWebhooks({ accessToken, storeHash });
                const appUrl = process.env.APP_URL;
                
                // Find and remove webhooks created by this app
                for (const webhook of webhooks) {
                    if (webhook.destination?.includes(appUrl) && webhook.scope === 'store/order/created') {
                        await removeWebhook({ accessToken, storeHash, webhookId: webhook.id });
                    }
                }
            } catch (webhookError) {
                // Log error but don't fail uninstall
                console.error('Failed to clean up webhooks during uninstall:', webhookError);
            }
        }

        await removeDataStore(session);
        res.status(200).end();
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}

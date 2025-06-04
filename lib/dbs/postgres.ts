import { neon } from '@neondatabase/serverless';
import { SessionProps } from '../../types';

// Neon serverless connection
const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
}
const sql = neon(POSTGRES_URL);

// Helper function to execute queries (keeping the same interface for compatibility)
async function executeQuery(text: string, params?: any[]) {
    const result = await sql(text, params || []);
    
    return result;
}

// Export sql for direct use if needed
export { sql as query };

// ----------- Existing Methods ------------
export async function setUser({ user }: SessionProps) {
    if (!user) return null;
    const { email, id, username } = user;
    const sqlQuery = `
        INSERT INTO users (user_id, email, username) 
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) 
        DO UPDATE SET email = EXCLUDED.email, username = EXCLUDED.username
    `;
    await executeQuery(sqlQuery, [id, email, username]);
}

export async function setStore(session: SessionProps) {
    const { access_token: accessToken, context, scope } = session;
    if (!accessToken || !scope) return null;
    const storeHash = context?.split('/')[1] || '';
    const sqlQuery = `
        INSERT INTO stores (store_hash, access_token, scope) 
        VALUES ($1, $2, $3)
        ON CONFLICT (store_hash) 
        DO UPDATE SET access_token = EXCLUDED.access_token, scope = EXCLUDED.scope
    `;
    await executeQuery(sqlQuery, [storeHash, accessToken, scope]);
}

export async function setStoreUser(session: SessionProps) {
    const { access_token: accessToken, context, owner, sub, user: { id: userId } } = session;
    if (!userId) return null;
    const contextString = context ?? sub;
    const storeHash = contextString?.split('/')[1] || '';
    
    const selectSql = 'SELECT * FROM store_users WHERE user_id = $1 AND store_hash = $2';
    const storeUser = await executeQuery(selectSql, [String(userId), storeHash]);

    if (accessToken) {
        if (!storeUser.length) {
            const insertSql = 'INSERT INTO store_users (user_id, store_hash, is_admin) VALUES ($1, $2, $3)';
            await executeQuery(insertSql, [String(userId), storeHash, true]);
        } else if (!storeUser[0]?.is_admin) {
            const updateSql = 'UPDATE store_users SET is_admin = true WHERE user_id = $1 AND store_hash = $2';
            await executeQuery(updateSql, [String(userId), storeHash]);
        }
    } else {
        if (!storeUser.length) {
            const insertSql = 'INSERT INTO store_users (user_id, store_hash, is_admin) VALUES ($1, $2, $3)';
            await executeQuery(insertSql, [String(userId), storeHash, owner.id === userId]);
        }
    }
}

export async function deleteUser({ context, user, sub }: SessionProps) {
    const contextString = context ?? sub;
    const storeHash = contextString?.split('/')[1] || '';
    const sqlQuery = 'DELETE FROM store_users WHERE user_id = $1 AND store_hash = $2';
    await executeQuery(sqlQuery, [String(user?.id), storeHash]);
}

export async function hasStoreUser(storeHash: string, userId: string) {
    if (!storeHash || !userId) return false;
    const sqlQuery = 'SELECT * FROM store_users WHERE user_id = $1 AND store_hash = $2 LIMIT 1';
    const results = await executeQuery(sqlQuery, [userId, storeHash]);

    return results.length > 0;
}

export async function getStoreToken(storeHash: string) {
    if (!storeHash) return null;
    const sqlQuery = 'SELECT access_token FROM stores WHERE store_hash = $1';
    const results = await executeQuery(sqlQuery, [storeHash]);

    return results.length ? results[0].access_token : null;
}

export async function deleteStore({ store_hash: storeHash }: SessionProps) {
    const sqlQuery = 'DELETE FROM stores WHERE store_hash = $1';
    await executeQuery(sqlQuery, [storeHash]);
}

export async function hasAppExtensionsScope(storeHash: string): Promise<boolean> {
    const sqlQuery = 'SELECT scope FROM stores WHERE store_hash = $1';
    const scopes = await executeQuery(sqlQuery, [storeHash]);
    const row = scopes[0];

    return row?.scope?.includes('store_app_extensions_manage') ?? false;
}

// ----------- New Methods for Bundles ------------

export async function saveBundle(productId: number, isBundle: boolean) {
    const sqlQuery = `
        INSERT INTO bundles (product_id, is_bundle)
        VALUES ($1, $2)
        ON CONFLICT (product_id) 
        DO UPDATE SET is_bundle = EXCLUDED.is_bundle
    `;

    return executeQuery(sqlQuery, [productId, isBundle]);
}

export async function updateBundleLinks(productId: number, linkedProductIds: number[]) {
    // Delete existing links
    await executeQuery('DELETE FROM bundle_links WHERE bundle_id = $1', [productId]);

    // Insert new links
    if (linkedProductIds.length > 0) {
        const values = linkedProductIds.map((id, index) => `($1, $${index + 2})`).join(', ');
        const sqlQuery = `INSERT INTO bundle_links (bundle_id, product_id) VALUES ${values}`;
        await executeQuery(sqlQuery, [productId, ...linkedProductIds]);
    }
}

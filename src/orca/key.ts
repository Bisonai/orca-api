import { Keypair } from '@solana/web3.js';
import { readFile, writeFile } from 'mz/fs';

export function generateKeypair(): Keypair {
    return Keypair.generate();
}

export async function saveKeypair(
    keypair: Keypair,
    keypairPath: 'secret-key.json',
) {
    const secretKey = '[' + keypair.secretKey.toString() + ']';
    await writeFile(keypairPath, secretKey, {
        encoding: 'utf8',
    });
}

export async function loadKeypair(
    secretkeyPath = 'secret-key.json',
): Promise<Keypair> {
    const secretKeyString = await readFile(secretkeyPath, {
        encoding: 'utf8',
    });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const owner = Keypair.fromSecretKey(secretKey);
    return owner;
}

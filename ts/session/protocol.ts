import { ContactPreKey, ContactSignedPreKey } from './types';

export async function storeContactPreKey(preKey: ContactPreKey) {
  await window.Signal.Data.createOrUpdateContactPreKey(preKey);
}

export async function loadContactPreKey(
  pubKey: string
): Promise<ContactPreKey | undefined> {
  const preKey = await window.Signal.Data.getContactPreKeyByIdentityKey(pubKey);
  if (!preKey) {
    window.log.warn('Failed to fetch contact prekey:', pubKey);
  }

  return preKey || undefined;
}

export async function removeContactPreKey(pubKey: string): Promise<void> {
  await window.Signal.Data.removeContactPreKeyByIdentityKey(pubKey);
}

export async function clearContactPreKeysStore(): Promise<void> {
  await window.Signal.Data.removeAllContactPreKets();
}

type PartialContactSignedPreKey = Pick<
  ContactSignedPreKey,
  'identityKeyString' | 'keyId' | 'publicKey' | 'signature'
>;
export async function storeContactSignedPreKey(
  signedPreKey: ContactSignedPreKey | PartialContactSignedPreKey
): Promise<void> {
  const key = {
    created_at: Date.now(),
    confirmed: false,
    ...signedPreKey,
  };
  await window.Signal.Data.createOrUpdateContactSignedPreKey(key);
}

export async function loadContactSignedPreKey(
  pubKey: string
): Promise<ContactSignedPreKey | undefined> {
  const preKey = await window.Signal.Data.getContactSignedPreKeyByIdentityKey(
    pubKey
  );
  if (!preKey) {
    window.log.warn('Failed to fetch contact signed prekey:', pubKey);
  }

  return preKey || undefined;
}

export async function removeContactSignedPreKey(pubKey: string): Promise<void> {
  await window.Signal.Data.removeContactSignedPreKeyByIdentityKey(pubKey);
}

export async function clearContactSignedPreKeysStore(): Promise<void> {
  await window.Signal.Data.removeAllContactSignedPreKeys();
}

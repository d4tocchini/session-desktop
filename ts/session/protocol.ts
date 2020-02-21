import { ContactPreKey, ContactSignedPreKey } from './types';
import * as Data from '../../js/modules/data';

export async function storeContactPreKey(preKey: ContactPreKey) {
  await Data.createOrUpdateContactPreKey(preKey);
}

export async function loadContactPreKey(
  pubKey: string
): Promise<ContactPreKey | undefined> {
  const preKey = await Data.getContactPreKeyByIdentityKey(pubKey);
  if (!preKey) {
    window.log.warn('Failed to fetch contact prekey:', pubKey);
  }

  return preKey || undefined;
}

export async function removeContactPreKey(pubKey: string): Promise<void> {
  await Data.removeContactPreKeyByIdentityKey(pubKey);
}

export async function clearContactPreKeysStore(): Promise<void> {
  await Data.removeAllContactPreKeys();
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
  await Data.createOrUpdateContactSignedPreKey(key);
}

export async function loadContactSignedPreKey(
  pubKey: string
): Promise<ContactSignedPreKey | undefined> {
  const preKey = await Data.getContactSignedPreKeyByIdentityKey(pubKey);
  if (!preKey) {
    window.log.warn('Failed to fetch contact signed prekey:', pubKey);
  }

  return preKey || undefined;
}

export async function removeContactSignedPreKey(pubKey: string): Promise<void> {
  await Data.removeContactSignedPreKeyByIdentityKey(pubKey);
}

export async function clearContactSignedPreKeysStore(): Promise<void> {
  await Data.removeAllContactSignedPreKeys();
}

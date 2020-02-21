import {
  ContactPreKey,
  ContactSignedPreKey,
  PairingAuthorisation,
} from '../../ts/session/types';

export function getPasswordHash(): Proimse<string | undefined>;
export function searchMessages(query: string): Promise<Array<any>>;
export function searchConversations(query: string): Promise<Array<any>>;
export function getPrimaryDeviceFor(pubKey: string): Promise<string | null>;
export function getGrantAuthorisationForSecondaryPubKey(
  pubKey: string
): Promise<PairingAuthorisation | null>;

// Contact Pre Key

export async function createOrUpdateContactPreKey(
  preKey: ContactPreKey
): Promise<void>;
export async function getContactPreKeyByIdentityKey(
  pubKey: string
): Promise<ContactPreKey | null>;
export async function removeContactPreKeyByIdentityKey(
  pubKey: string
): Promise<void>;
export async function removeAllContactPreKeys(): Promise<void>;

// Contact Signed Pre Key

export async function createOrUpdateContactSignedPreKey(
  signedPreKey: ContactSignedPreKey
): Promise<void>;
export async function getContactSignedPreKeyByIdentityKey(
  pubKey: string
): Promise<ContactSignedPreKey | null>;
export async function removeContactSignedPreKeyByIdentityKey(
  pubKey: string
): Promise<void>;
export async function removeAllContactSignedPreKeys(): Promise<void>;

// Pairing Authorisation

export async function createOrUpdatePairingAuthorisation(
  authorisation: PairingAuthorisation
): Promise<void>;
export async function removePairingAuthorisationForSecondaryPubKey(
  pubKey: string
): Promise<void>;
export async function getGrantAuthorisationForSecondaryPubKey(
  pubKey: string
): Promise<PairingAuthorisation | null>;
export async function getAuthorisationForSecondaryPubKey(
  pubKey: string
): Promise<PairingAuthorisation | null>;
export async function getGrantAuthorisationsForPrimaryPubKey(
  pubKey: string
): Promise<Array<PairingAuthorisation>>;
export async function getSecondaryDevicesFor(
  pubKey: string
): Promise<Array<string>>;
export async function getPrimaryDeviceFor(
  pubKey: string
): Promise<string | null>;
export async function getPairedDevicesFor(
  pubKey: string
): Promise<Array<string>>;

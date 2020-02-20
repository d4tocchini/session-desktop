export interface PairingAuthorisation {
  primaryDevicePubKey: string;
  secondaryDevicePubKey: string;
  requestSignature: string;
  grantSignature?: string;
}

export function searchMessages(query: string): Promise<Array<any>>;
export function searchConversations(query: string): Promise<Array<any>>;
export function getPrimaryDeviceFor(pubKey: string): Promise<string | null>;
export function getGrantAuthorisationForSecondaryPubKey(
  pubKey: string
): Promise<PairingAuthorisation | null>;

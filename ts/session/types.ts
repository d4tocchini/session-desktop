export interface PairingAuthorisation {
  primaryDevicePubKey: string;
  secondaryDevicePubKey: string;
  requestSignature: string; // base64
  grantSignature?: string; // base64
}

export interface PreKeyBundle {
  identityKey: Uint8Array;
  deviceId: number;
  preKeyId: number;
  preKey: Uint8Array;
  signedKeyId: number;
  signedKey: Uint8Array;
  signature: Uint8Array;
}

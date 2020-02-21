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

export interface ContactPreKey {
  identityKeyString: string;
  keyId: number;
  publicKey: ArrayBuffer;
}

export interface ContactSignedPreKey {
  identityKeyString: string;
  keyId: number;
  publicKey: ArrayBuffer;
  signature: ArrayBuffer;
  created_at: number;
  confirmed: boolean;
}

export interface PairingAuthorisation {
  primaryDevicePubKey: string;
  secondaryDevicePubKey: string;
  requestSignature: string;
  grantSignature?: string;
}

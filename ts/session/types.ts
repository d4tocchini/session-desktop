export interface PairingAuthorisation {
  primaryDevicePubKey: string;
  secondaryDevicePubKey: string;
  requestSignature: ArrayBuffer;
  grantSignature?: ArrayBuffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return window.dcodeIO.ByteBuffer.wrap(buffer).toBase64();
}

export function base64ToArrayBuffer(base64string: string): ArrayBuffer {
  return window.dcodeIO.ByteBuffer.wrap(base64string, 'base64').toArrayBuffer();
}

export function bytesFromString(string: string): ArrayBuffer {
  return window.dcodeIO.ByteBuffer.wrap(string, 'utf8').toArrayBuffer();
}
export function stringFromBytes(buffer: ArrayBuffer): string {
  return window.dcodeIO.ByteBuffer.wrap(buffer).toString('utf8');
}

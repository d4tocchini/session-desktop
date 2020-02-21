import { PreKeyBundle } from './types';
import { SignalService } from '../protobuf';
import { PairingAuthorisation } from '../../js/modules/data';

const timers: { [pubKey: string]: number } = {};
const REFRESH_DELAY = 60 * 1000;

export async function getPreKeyBundleForContact(
  pubKey: string
): Promise<PreKeyBundle> {
  const myKeyPair = await window.textsecure.storage.protocol.getIdentityKeyPair();
  const identityKey = myKeyPair.pubKey;

  // Retrieve ids. The ids stored are always the latest generated + 1
  const signedKeyId = window.textsecure.storage.get('signedKeyId', 2) - 1;

  const [signedKey, preKey] = await Promise.all([
    window.textsecure.storage.protocol.loadSignedPreKey(signedKeyId),
    loadPreKey(pubKey),
  ]);

  return {
    identityKey: new Uint8Array(identityKey),
    deviceId: 1,
    preKeyId: preKey.keyId,
    signedKeyId,
    preKey: new Uint8Array(preKey.pubKey),
    signedKey: new Uint8Array(signedKey.pubKey),
    signature: new Uint8Array(signedKey.signature),
  };
}

export async function saveContactPreKeyBundle({
  identityKey,
  preKeyId,
  signedKeyId,
  preKey,
  signedKey,
  signature,
}: PreKeyBundle): Promise<void> {
  const pubKey = window.StringView.arrayBufferToHex(identityKey) as string;
  const signedPreKey = {
    keyId: signedKeyId,
    publicKey: signedKey,
    signature,
  };

  const signedKeyPromise = window.textsecure.storage.protocol.storeContactSignedPreKey(
    pubKey,
    signedPreKey
  );

  const preKeyObject = {
    publicKey: preKey,
    keyId: preKeyId,
  };

  const preKeyPromise = window.textsecure.storage.protocol.storeContactPreKey(
    pubKey,
    preKeyObject
  );

  await Promise.all([signedKeyPromise, preKeyPromise]);
}

export async function removeContactPreKeyBundle(pubKey: string): Promise<void> {
  await Promise.all([
    window.textsecure.storage.protocol.removeContactPreKey(pubKey),
    window.textsecure.storage.protocol.removeContactSignedPreKey(pubKey),
  ]);
}

export async function verifyFriendRequestAcceptPreKey(
  pubKey: string,
  buffer: ByteBuffer
) {
  const storedPreKey = await window.textsecure.storage.protocol.loadPreKeyForContact(
    pubKey
  );
  if (!storedPreKey) {
    throw new Error(
      'Received a friend request from a pubkey for which no prekey bundle was created'
    );
  }

  // need to pop the version
  const _version = buffer.readUint8();
  const uIntBuffer = new Uint8Array(buffer.toArrayBuffer());
  let preKeyProto: SignalService.PreKeyWhisperMessage;
  try {
    preKeyProto = SignalService.PreKeyWhisperMessage.decode(uIntBuffer);
  } catch (e) {
    throw new Error(
      `Could not decode PreKeyWhisperMessage while attempting to match the preKeyId. ${e}`
    );
  }

  const { preKeyId } = preKeyProto;
  if (storedPreKey.keyId !== preKeyId) {
    throw new Error(
      'Received a preKeyWhisperMessage (friend request accept) from an unknown source'
    );
  }
}

export async function removePairingAuthorisationForSecondaryPubKey(
  pubKey: string
): Promise<void> {
  return window.Signal.Data.removePairingAuthorisationForSecondaryPubKey(
    pubKey
  );
}

export async function getGrantAuthorisationForSecondaryPubKey(
  secondaryPubKey: string
): Promise<PairingAuthorisation | null> {
  const conversation = window.ConversationController.get(secondaryPubKey);
  if (!conversation || conversation.isPublic() || conversation.isRss()) {
    return null;
  }
  await fetchPairingAuthorisationsFor(secondaryPubKey);

  return window.Signal.Data.getGrantAuthorisationForSecondaryPubKey(
    secondaryPubKey
  );
}

export async function getAuthorisationForSecondaryPubKey(
  secondaryPubKey: string
): Promise<PairingAuthorisation | null> {
  await fetchPairingAuthorisationsFor(secondaryPubKey);

  return window.Signal.Data.getAuthorisationForSecondaryPubKey(secondaryPubKey);
}

// Private

async function loadPreKey(
  pubKey: string
): Promise<{ pubKey: any; keyId: number }> {
  // retrieve existing prekey if we already generated one for that recipient
  const storedPreKey = await window.textsecure.storage.protocol.loadPreKeyForContact(
    pubKey
  );
  if (storedPreKey) {
    return { pubKey: storedPreKey.pubKey, keyId: storedPreKey.keyId };
  }
  // generate and store new prekey
  const preKeyId = window.textsecure.storage.get('maxPreKeyId', 1) as number;
  window.textsecure.storage.put('maxPreKeyId', preKeyId + 1);
  const newPreKey = await window.libsignal.KeyHelper.generatePreKey(preKeyId);
  await window.textsecure.storage.protocol.storePreKey(
    newPreKey.keyId,
    newPreKey.keyPair,
    pubKey
  );

  return { pubKey: newPreKey.keyPair.pubKey, keyId: preKeyId };
}

async function fetchPrimaryDeviceMapping(
  pubKey: string
): Promise<Array<PairingAuthorisation>> {
  if (!window.lokiFileServerAPI) {
    // If this is not defined then we are initiating a pairing
    return [];
  }
  const deviceMapping = await window.lokiFileServerAPI.getUserDeviceMapping(
    pubKey
  );
  if (!deviceMapping) {
    return [];
  }
  let authorisations =
    (deviceMapping.authorisations as Array<PairingAuthorisation>) || [];
  if (deviceMapping.isPrimary === '0') {
    const authorisation = authorisations.find(
      a => a.secondaryDevicePubKey === pubKey
    );
    if (authorisation && authorisation.primaryDevicePubKey) {
      // do NOT call getprimaryDeviceMapping recursively
      // in case both devices are out of sync and think they are
      // each others' secondary pubkey.
      const primaryDeviceMapping = await window.lokiFileServerAPI.getUserDeviceMapping(
        authorisation.primaryDevicePubKey
      );
      if (!primaryDeviceMapping) {
        return [];
      }
      authorisations = primaryDeviceMapping.authorisations;
    }
  }

  return authorisations || [];
}

// if the device is a secondary device,
// fetch the device mappings for its primary device
async function fetchPairingAuthorisationsFor(pubKey: string): Promise<void> {
  // Will be false if there is no timer
  const cacheValid = timers[pubKey] > Date.now();
  if (cacheValid) {
    return;
  }
  timers[pubKey] = Date.now() + REFRESH_DELAY;
  const authorisations = await fetchPrimaryDeviceMapping(pubKey);
  await Promise.all(authorisations.map(savePairingAuthorisation));
}

async function savePairingAuthorisation(
  authorisation: PairingAuthorisation
): Promise<void> {
  // Ensure that we have a conversation for all the devices
  const conversation = await window.ConversationController.getOrCreateAndWait(
    authorisation.secondaryDevicePubKey,
    'private'
  );
  await conversation.setSecondaryStatus(
    true,
    authorisation.primaryDevicePubKey
  );
  await window.Signal.Data.createOrUpdatePairingAuthorisation(authorisation);
}

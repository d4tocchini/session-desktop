/* tslint:disable: no-backbone-get-set-outside-model */

import { SignalService as Protobuf } from '../protobuf';
import { PairingAuthorisation } from './types';
import { Conversation } from '../../js/models/conversations';

export async function sendOnlineBroadcaseMessage(
  pubKey: string,
  isPing: boolean = false
): Promise<void> {
  const authorisation = await window.libloki.storage.getGrantAuthorisationForSecondaryPubKey(
    pubKey
  );
  if (authorisation && authorisation.primaryDevicePubKey !== pubKey) {
    return sendOnlineBroadcaseMessage(authorisation.primaryDevicePubKey);
  }

  // We result loki address message for sending "background" messages
  const lokiAddressMessage = new Protobuf.LokiAddressMessage({
    p2pAddress: null,
    p2pPort: null,
    type: Protobuf.LokiAddressMessage.Type.HOST_UNREACHABLE,
  });

  const content = new Protobuf.Content({ lokiAddressMessage });
  const options: any = { messageType: 'onlineBroadcast', isPing };

  // Send a empty message with information about how to contact us directly
  const outgoingMessage = new window.textsecure.OutgoingMessage(
    null, // server
    Date.now(), // timestamp,
    [pubKey], // numbers
    content, // message
    true, // silent
    () => null, // callback
    options
  );
  await outgoingMessage.sendToNumber(pubKey);
}

export async function sendBackgroundMessage(pubKey: string): Promise<void> {
  return sendOnlineBroadcaseMessage(pubKey);
}

export function createPairingAuthorisationProtoMessage({
  primaryDevicePubKey,
  secondaryDevicePubKey,
  requestSignature,
  grantSignature,
}: PairingAuthorisation): Protobuf.PairingAuthorisationMessage {
  return new Protobuf.PairingAuthorisationMessage({
    primaryDevicePubKey,
    secondaryDevicePubKey,
    requestSignature: new Uint8Array(requestSignature),
    grantSignature: grantSignature ? new Uint8Array(grantSignature) : null,
  });
}

export async function sendUnpairingMessageToSlaveDevice(
  pubKey: String
): Promise<void> {
  const dataMessage = new Protobuf.DataMessage({
    flags: Protobuf.DataMessage.Flags.UNPAIRING_REQUEST,
  });
  const content = new Protobuf.Content({ dataMessage });
  const options: any = { messageType: 'device-unpairing' };
  const outgoingMessage = new window.textsecure.OutgoingMessage(
    null, // server
    Date.now(), // timestamp,
    [pubKey], // numbers
    content, // message
    true, // silent
    () => null, // callback
    options
  );
  await outgoingMessage.sendToNumber(pubKey);
}

// TODO: create a typed definition file for conversation model
export async function createContactSyncProtoMessage(
  conversations: [Conversation]
): Promise<Protobuf.SyncMessage | null> {
  const sessionContacts = conversations.filter(
    c => c.isPrivate() && !c.isSecondaryDevice()
  );
  if (sessionContacts.length === 0) {
    return null;
  }

  const rawContacts = await Promise.all(
    sessionContacts.map(async conversation => {
      const profile = conversation.getLokiProfile();
      const number = conversation.getNumber();
      const name = profile
        ? profile.displayName
        : conversation.getProfileName();
      const status = await conversation.safeGetVerified();
      const protoState = window.textsecure.storage.protocol.convertVerifiedStatusToProtoState(
        status
      );
      const verified = new Protobuf.Verified({
        state: protoState,
        destination: number,
        identityKey: window.StringView.hexToArrayBuffer(number),
      });

      return {
        name,
        verified,
        number,
        nickname: conversation.getNickname(),
        blocked: conversation.isBlocked(),
        expireTimer: conversation.get('expireTimer'),
      };
    })
  );

  // Convert raw contacts to an array of buffers
  const contactDetails = rawContacts
    .filter(x => x.number !== window.textsecure.storage.user.getNumber())
    .map(x => new Protobuf.ContactDetails(x))
    .map(x => Protobuf.ContactDetails.encode(x).finish());

  const byteBuffer = serialiseByteBuffers(contactDetails);
  const data = new Uint8Array(byteBuffer.toArrayBuffer());
  const contacts = new Protobuf.SyncMessage.Contacts({ data });

  return new Protobuf.SyncMessage({ contacts });
}

export async function sendPairingAuthorisation(
  authorisation: PairingAuthorisation,
  recipientPubKey: string
): Promise<void> {
  const pairingAuthorisation = createPairingAuthorisationProtoMessage(
    authorisation
  );
  const ourNumber = window.textsecure.storage.user.getNumber();
  const ourConversation = await window.ConversationController.getOrCreateAndWait(
    ourNumber,
    'private'
  );
  const content = new Protobuf.Content({ pairingAuthorisation });
  const isGrant = authorisation.primaryDevicePubKey === ourNumber;
  if (isGrant) {
    // Send profile name to secondary device
    const lokiProfile = ourConversation.getLokiProfile();
    if (lokiProfile) {
      // profile.avatar is the path to the local image
      // replace with the avatar URL
      const avatarPointer = ourConversation.get('avatarPointer');
      lokiProfile.avatar = avatarPointer;
      const profile = new Protobuf.DataMessage.LokiProfile(lokiProfile);
      const profileKey = window.storage.get('profileKey');
      const dataMessage = new Protobuf.DataMessage({
        profile,
        profileKey,
      });
      content.dataMessage = dataMessage;
    }
  }

  // Send
  const options: any = { messageType: 'pairing-request' };

  return new Promise<void>((resolve, reject) => {
    const timestamp = Date.now();
    const outgoingMessage = new window.textsecure.OutgoingMessage(
      null, // server
      timestamp,
      [recipientPubKey], // numbers
      content, // message
      true, // silent
      (result: { errors: Array<any> }) => {
        // callback
        if (result.errors.length > 0) {
          reject(result.errors[0]);
        } else {
          resolve();
        }
      },
      options
    );
    outgoingMessage.sendToNumber(recipientPubKey);
  });
}

// Serialise as <Element0.length><Element0><Element1.length><Element1>...
// This is an implementation of the reciprocal of contacts_parser.js
function serialiseByteBuffers(buffers: Array<Uint8Array>): ByteBuffer {
  const result = new window.dcodeIO.ByteBuffer();
  buffers.forEach(buffer => {
    // bytebuffer container expands and increments
    // offset automatically
    result.writeInt32(buffer.byteLength);
    result.append(buffer);
  });
  result.limit = result.offset;
  result.reset();

  return result;
}

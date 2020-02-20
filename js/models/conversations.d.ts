export interface Conversation extends Backbone.Model {
  isOnline(): boolean;
  isMe(): boolean;
  isOurPrimaryDevice(): boolean;
  isOurDevice(): Promise<boolean>;
  isOurLocalDevice(): boolean;
  isPrivate(): boolean;
  isPublic(): boolean;
  isClosedGroup(): boolean;
  isClosable(): boolean;
  isRss(): boolean;
  isBlocked(): boolean;
  block(): void;
  unblock(): void;
  acceptFriendRequest(): Promise<void>;
  declineFriendRequest(): Promise<void>;
  setMessageSelectionBackdrop(): void;
  addMessageSelection(id: any): void;
  removeMessageSelection(id: any): void;
  resetMessageSelection(): void;
  bumpTyping(): Promise<void>;
  setTypingRefreshTimer(): void;
  setTypingPauseTimer(): void;
  clearTypingPauseTimer(): void;
  sendTypingMessage(isTyping: boolean): void;
  cleanup(): Promise<void>;
  updateProfileAvatar(): Promise<void>;
  updateAndMerge(message: any): Promise<void>;
  isFriendRequestStatusNone(): boolean;
  isPendingFriendRequest(): boolean;
  hasSendFriendRequest(): boolean;
  hasReceivedFriendRequest(): boolean;
  isFriend(): boolean;
  isFriendWithAnyDevice(): boolean;
  isSecondaryDevice(): boolean;
  getLokiProfile(): ({ displayName: string; avatar?: string }) | undefined;
  getNickname(): string | undefined;
  setNickname(nickname?: string): Promise<void>;
  getNumber(): string;
  getProfileName(): string | null;
  getAvatarPath(): string | undefined;
  safeGetVerified(): Promise<number>;

  // This should be slowly fazed out
  get(key: string): any;
}

export namespace Conversation {
  type Type = 'private' | 'group';
}

export default Conversation;

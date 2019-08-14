import { context, storage, near, collections } from "./near";
import { PostedMessage } from "./model.near";
const MESSAGE_LIMIT = 10;
let messages = collections.vector<PostedMessage>("m");
export function addMessage(text: string, id: string, name: string): void {
  let message: PostedMessage = { id, text, name };
  storage.setString(id, text);
  messages.push(message);
}

export function getMessages(): Array<PostedMessage> {
  let numMessages = min(MESSAGE_LIMIT, messages.length);
  let startIndex = messages.length - numMessages;
  let result = Array.create<PostedMessage>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = messages[i + startIndex];
  }
  return result;
}

export function getRangeMessages(start: i32 = 0): Array<PostedMessage> {
  let numMessages: i32 = messages.length < start ? 0 : messages.length - start;
  let result = Array.create<PostedMessage>(numMessages);
  if (numMessages > 0) {
    let startIndex = start;
    for (let i = 0; i < numMessages; i++) {
      result[i] = messages[i + startIndex];
      result[i].index = <u64>i + startIndex;
    }
  }
  return result;
}

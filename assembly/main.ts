import { storage, PersistentVector } from "near-runtime-ts";
import { PostedMessage } from "./model";
let messages = new PersistentVector<PostedMessage>("m");
export function addMessage(
  text: string,
  id: string,
  name: string,
  photo: string,
  email: string,
  date: string
): void {
  let message: PostedMessage = {
    id,
    text,
    name,
    photo,
    date,
    email,
    index: 0
  };
  storage.setString(id, date);
  messages.push(message);
}

export function getRangeMessages(start: i32 = 0): Array<PostedMessage> {
  let numMessages: i32 = messages.length < start ? 0 : messages.length - start;
  let result = Array.create<PostedMessage>(numMessages);
  if (numMessages > 0) {
    let startIndex = start;
    for (let i = 0; i < numMessages; i++) {
      result[i] = messages[i + startIndex];
      result[i].index = i + startIndex;
    }
  }
  return result;
}

export default interface Conversation {
  id: string;
  Participant: {
    User: {
      id: string;
      first_name: string;
      last_name: string;
      image: string;
    };
  }[];
  Message: {
    id: string;
    message: string;
    created_at: Date;
    sender: string;
    receiver: string;
  }[];
  unreadCount: number;
}

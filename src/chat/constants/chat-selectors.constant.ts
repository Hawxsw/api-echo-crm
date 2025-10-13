export const USER_CHAT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: true,
  email: true,
};

export const USER_WITH_ROLE_SELECT = {
  ...USER_CHAT_SELECT,
  role: true,
};

export const SENDER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: true,
};

export const getChatWithParticipantsInclude = () => ({
  participants: {
    include: {
      user: { select: USER_CHAT_SELECT },
    },
  },
});

export const getMessageWithSenderInclude = () => ({
  sender: { select: SENDER_SELECT },
});


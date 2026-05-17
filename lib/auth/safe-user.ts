export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  passwordHash?: string | null;
  status?: string;
};

export function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: string | null;
  isAdmin: boolean | null;
  coinBalance: number | null;
  token?: string; // Optional token for client-side storage
}
export interface AppItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
  code: string;
  platform: "ios" | "android" | "cross-platform";
  category: string;
  icon: string;
  creatorId: string;
  creatorEmail: string;
  published: boolean;
  likesCount?: number;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
  features: string[];
  lastAiCode?: string;
}

export interface CommentItem {
  id: string;
  appId: string;
  userId: string;
  userEmail: string;
  commentText: string;
  createdAt: string;
}

export type ActiveTab = "design-studio" | "marketplace" | "my-vault";

export const appRoutes = {
  login: "/",
  register: "/register",
  pendingApproval: "/pending-approval",
  home: "/home",
  bookDetail: "/book/:id",
  search: "/search",
  profile: "/profile",
  readingList: "/reading-list",
  addBook: "/add-book",
  editBook: "/edit-book/:id",
  requests: "/requests",
  ownerDashboard: "/owner-dashboard",
  myBorrows: "/my-borrows",
  admin: "/admin",
  notifications: "/notifications",
  settings: "/settings",
  forbidden: "/403",    
  notFound: "/404",
  guestBooks: "/browse",
  guestBookDetail: "/browse/:id",
} as const;

export const navPaths = {
  home: "/home",
  profile: "/profile",
  requests: "/requests",
  readingList: "/reading-list",
  addBook: "/add-book",
  admin: "/admin",
  notifications: "/notifications",
  settings: "/settings",
  ownerDashboard: "/owner-dashboard",
  myBorrows: "/my-borrows",
  search: "/search",
  browse: "/browse",
} as const;

export const buildBookPath = (id: number): string => `/book/${id}`;
export const buildEditBookPath = (id: number): string => `/edit-book/${id}`;
export const buildSearchPath = (q: string): string =>
  `/search?q=${encodeURIComponent(q)}`;
export const buildGuestBookPath = (id: number): string => `/browse/${id}`;

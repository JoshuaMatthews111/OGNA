export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
}

export interface LiveStream {
  id: string;
  title: string;
  isLive: boolean;
  imageUrl: string;
  startTime?: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  audioUrl: string;
  videoUrl?: string;
  imageUrl?: string;
  duration: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
  joinDate: string;
  active: boolean;
  phone?: string;
  address?: string;
  courseProgress?: CourseProgress[];
  eventRSVPs?: string[];
  donations?: Donation[];
  prayerRequests?: PrayerRequest[];
  volunteerSignups?: VolunteerSignup[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  lessons: Lesson[];
  imageUrl?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  duration: string;
  order: number;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'link';
  url: string;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completedLessons: string[];
  progress: number;
  lastAccessed: string;
}

export interface Donation {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  date: string;
  method: 'card' | 'bank' | 'cash' | 'other';
  purpose: string;
  recurring: boolean;
  status: 'completed' | 'pending' | 'failed';
}

export interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  category: 'healing' | 'family' | 'finances' | 'guidance' | 'other';
  isAnonymous: boolean;
  status: 'pending' | 'praying' | 'answered';
  prayers: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerSignup {
  id: string;
  userId: string;
  eventId: string;
  role: string;
  skills: string[];
  availability: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'event' | 'sermon' | 'course' | 'donation';
  recipients: 'all' | 'members' | 'admins' | string[];
  scheduledFor?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'sermon' | 'course' | 'event' | 'general';
  status: 'uploading' | 'completed' | 'failed';
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'content' | 'events' | 'donations' | 'settings';
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
}

export interface Analytics {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Record<string, number>;
  };
  content: {
    sermons: number;
    courses: number;
    events: number;
    totalViews: number;
  };
  donations: {
    total: number;
    thisMonth: number;
    recurring: number;
    average: number;
  };
  engagement: {
    activeUsers: number;
    courseCompletions: number;
    eventAttendance: number;
    prayerRequests: number;
  };
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: 'bible-study' | 'fellowship' | 'ministry' | 'support' | 'youth' | 'other';
  members: string[];
  admins: string[];
  isPrivate: boolean;
  imageUrl?: string;
  nextMeeting?: string;
  meetingLocation?: string;
  createdAt: string;
  createdBy: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'link';
  mediaUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  groupId?: string;
  category: 'general' | 'prayer' | 'testimony' | 'announcement' | 'question';
  likes: string[];
  comments: Comment[];
  shares: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string;
  likes: string[];
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Testimony {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  category: 'healing' | 'provision' | 'salvation' | 'breakthrough' | 'other';
  isAnonymous: boolean;
  likes: string[];
  comments: Comment[];
  shares: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'call';
  mediaUrl?: string;
  callData?: {
    callId: string;
    type: 'audio' | 'video';
    duration: number;
    status: 'completed' | 'missed' | 'declined';
    recordingUrl?: string;
    transcription?: string;
  };
  isRead: boolean;
  isEdited: boolean;
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: DirectMessage;
  unreadCount: Record<string, number>;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: string;
  role: 'admin' | 'member' | 'guest';
  isOnline: boolean;
  lastSeen: string;
  groups: string[];
  followers: string[];
  following: string[];
  postsCount: number;
  testimoniesCount: number;
  prayerRequestsCount: number;
  privacy: {
    showEmail: boolean;
    showLocation: boolean;
    allowDirectMessages: boolean;
    showOnlineStatus: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  shippingInfo?: {
    weight: number;
    dimensions: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'paypal' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed';
  trackingNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId?: string;
  receiverName?: string;
  receiverAvatar?: string;
  participants?: CallParticipant[];
  isGroupCall: boolean;
  groupId?: string;
  groupName?: string;
  type: 'audio' | 'video';
  status: 'calling' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  startTime: string;
  endTime?: string;
  duration: number;
  isRecording: boolean;
  recordingUrl?: string;
  transcription?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  status: 'joined' | 'left' | 'waiting';
  joinedAt?: string;
  leftAt?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export interface CallRecording {
  id: string;
  callId: string;
  audioUrl: string;
  duration: number;
  transcription?: string;
  createdAt: string;
}

export interface CallNote {
  id: string;
  callId: string;
  content: string;
  timestamp: number;
  createdAt: string;
}
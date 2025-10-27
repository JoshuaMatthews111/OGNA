import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

// Mock content data
let mockContent = {
  images: {
    hero: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    events: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    sermons: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800',
    community: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'
  },
  sermons: [
    {
      id: '1',
      title: 'Walking in Faith',
      description: 'A powerful message about trusting God in difficult times',
      videoUrl: 'https://example.com/sermon1.mp4',
      audioUrl: 'https://example.com/sermon1.mp3',
      date: '2024-01-15',
      speaker: 'Prophet Joshua Matthews',
      duration: '45:30'
    }
  ],
  liveVideos: [
    {
      id: '1',
      title: 'Sunday Service Live',
      streamUrl: 'https://example.com/live1',
      scheduledTime: '2024-01-21T10:00:00Z',
      status: 'scheduled' as 'scheduled' | 'live' | 'ended',
      streamKey: null as string | null,
      rtmpUrl: null as string | null,
      streamType: 'youtube' as 'youtube' | 'obs' | 'rtmp',
      viewerCount: 0
    }
  ] as Array<{
    id: string;
    title: string;
    streamUrl: string;
    scheduledTime: string;
    status: 'scheduled' | 'live' | 'ended';
    streamKey: string | null;
    rtmpUrl: string | null;
    streamType: 'youtube' | 'obs' | 'rtmp';
    viewerCount: number;
  }>,
  streamKeys: [] as Array<{
    id: string;
    name: string;
    streamKey: string;
    rtmpUrl: string;
    isActive: boolean;
    createdAt: string;
    lastUsed: string | null;
    usageCount: number;
  }>,
  courses: [
    {
      id: '1',
      title: 'Biblical Foundations',
      description: 'Learn the fundamental principles of Christian faith',
      instructor: 'Prophet Joshua Matthews',
      duration: '8 weeks',
      category: 'Theology',
      level: 'beginner',
      createdAt: '2024-01-01',
      lessons: [
        {
          id: '1',
          title: 'Introduction to Scripture',
          description: 'Understanding the Bible as God\'s Word',
          duration: '30:00',
          order: 1,
          videoUrl: 'https://example.com/lesson1.mp4',
          resources: []
        }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
    }
  ],
  fileUploads: [] as Array<{
    id: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    category: 'sermon' | 'course' | 'event' | 'general';
    uploadedBy: string;
    uploadedAt: string;
    status: 'completed';
  }>
};

let donations = [
  {
    id: '1',
    userId: 'user1',
    amount: 100,
    currency: 'USD',
    date: '2024-01-15',
    method: 'card',
    purpose: 'General Fund',
    recurring: false,
    status: 'completed'
  }
];

let prayerRequests = [
  {
    id: '1',
    userId: 'user1',
    title: 'Healing Prayer',
    description: 'Please pray for my family member who is sick',
    category: 'healing',
    isAnonymous: false,
    status: 'pending',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

let volunteerSignups = [
  {
    id: '1',
    userId: 'user1',
    eventId: 'event1',
    role: 'Usher',
    skills: ['Customer Service'],
    availability: 'Sunday mornings',
    status: 'pending',
    createdAt: '2024-01-15T10:00:00Z'
  }
];

export const getContentProcedure = publicProcedure
  .query(() => {
    return {
      ...mockContent,
      donations,
      prayerRequests,
      volunteerSignups
    };
  });

export const updateImageProcedure = publicProcedure
  .input(z.object({
    section: z.enum(['hero', 'events', 'sermons', 'community']),
    imageUrl: z.string().url()
  }))
  .mutation(({ input }) => {
    mockContent.images[input.section] = input.imageUrl;
    return { success: true, images: mockContent.images };
  });

export const addSermonProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string(),
    videoUrl: z.string().url().optional(),
    audioUrl: z.string().url().optional(),
    speaker: z.string(),
    duration: z.string()
  }))
  .mutation(({ input }) => {
    const sermon = {
      id: Date.now().toString(),
      ...input,
      date: new Date().toISOString().split('T')[0]
    };
    
    mockContent.sermons.push({
      ...sermon,
      videoUrl: sermon.videoUrl || '',
      audioUrl: sermon.audioUrl || ''
    });
    return sermon;
  });

export const deleteSermonProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockContent.sermons = mockContent.sermons.filter(s => s.id !== input.id);
    return { success: true };
  });

export const addLiveVideoProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    streamUrl: z.string().optional(),
    streamType: z.enum(['youtube', 'obs', 'rtmp']).default('youtube'),
    streamKeyId: z.string().optional(),
    scheduledTime: z.string()
  }))
  .mutation(({ input }) => {
    let rtmpUrl = null;
    let streamKey = null;
    
    if (input.streamType === 'obs' || input.streamType === 'rtmp') {
      if (input.streamKeyId) {
        const key = mockContent.streamKeys.find(k => k.id === input.streamKeyId);
        if (key) {
          rtmpUrl = key.rtmpUrl;
          streamKey = key.streamKey;
          key.lastUsed = new Date().toISOString();
          key.usageCount += 1;
        }
      }
    }
    
    const liveVideo = {
      id: Date.now().toString(),
      title: input.title,
      streamUrl: input.streamUrl || '',
      scheduledTime: input.scheduledTime,
      status: 'scheduled' as 'scheduled' | 'live' | 'ended',
      streamKey,
      rtmpUrl,
      streamType: input.streamType,
      viewerCount: 0
    };
    
    mockContent.liveVideos.push(liveVideo);
    return liveVideo;
  });

export const deleteLiveVideoProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockContent.liveVideos = mockContent.liveVideos.filter(v => v.id !== input.id);
    return { success: true };
  });

export const updateLiveVideoStatusProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    status: z.enum(['scheduled', 'live', 'ended'])
  }))
  .mutation(({ input }) => {
    const videoIndex = mockContent.liveVideos.findIndex(v => v.id === input.id);
    if (videoIndex === -1) throw new Error('Live video not found');
    
    mockContent.liveVideos[videoIndex].status = input.status;
    return mockContent.liveVideos[videoIndex];
  });

export const generateStreamKeyProcedure = publicProcedure
  .input(z.object({
    name: z.string()
  }))
  .mutation(({ input }) => {
    const streamKey = {
      id: Date.now().toString(),
      name: input.name,
      streamKey: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      rtmpUrl: `rtmp://your-church-domain.com/live`,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    };
    
    mockContent.streamKeys.push(streamKey);
    return streamKey;
  });

export const deleteStreamKeyProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockContent.streamKeys = mockContent.streamKeys.filter(k => k.id !== input.id);
    return { success: true };
  });

export const toggleStreamKeyProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const keyIndex = mockContent.streamKeys.findIndex(k => k.id === input.id);
    if (keyIndex === -1) throw new Error('Stream key not found');
    
    mockContent.streamKeys[keyIndex].isActive = !mockContent.streamKeys[keyIndex].isActive;
    return mockContent.streamKeys[keyIndex];
  });

export const getStreamKeysProcedure = publicProcedure
  .query(() => {
    return mockContent.streamKeys;
  });

// Course management procedures
export const addCourseProcedure = publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string(),
    instructor: z.string(),
    duration: z.string(),
    category: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    imageUrl: z.string().url().optional(),
  }))
  .mutation(({ input }) => {
    const newCourse = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lessons: [],
      ...input,
      imageUrl: input.imageUrl || ''
    };
    mockContent.courses.push(newCourse);
    return newCourse;
  });

export const updateCourseProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    instructor: z.string().optional(),
    duration: z.string().optional(),
    category: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    imageUrl: z.string().url().optional(),
  }))
  .mutation(({ input }) => {
    const courseIndex = mockContent.courses.findIndex(c => c.id === input.id);
    if (courseIndex === -1) throw new Error('Course not found');
    
    mockContent.courses[courseIndex] = { ...mockContent.courses[courseIndex], ...input };
    return mockContent.courses[courseIndex];
  });

export const deleteCourseProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockContent.courses = mockContent.courses.filter(course => course.id !== input.id);
    return { success: true };
  });

// File upload procedures
export const uploadFileProcedure = publicProcedure
  .input(z.object({
    filename: z.string(),
    originalName: z.string(),
    size: z.number(),
    mimeType: z.string(),
    url: z.string().url(),
    category: z.enum(['sermon', 'course', 'event', 'general']),
    uploadedBy: z.string(),
  }))
  .mutation(({ input }) => {
    const newFile = {
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
      status: 'completed' as const,
      ...input,
    };
    mockContent.fileUploads.push(newFile);
    return newFile;
  });

export const deleteFileProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockContent.fileUploads = mockContent.fileUploads.filter(file => file.id !== input.id);
    return { success: true };
  });

export const getFilesProcedure = publicProcedure
  .input(z.object({
    category: z.enum(['sermon', 'course', 'event', 'general']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(({ input }) => {
    let filteredFiles = mockContent.fileUploads;
    
    if (input.category) {
      filteredFiles = filteredFiles.filter(file => file.category === input.category);
    }
    
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    
    return {
      files: filteredFiles.slice(offset, offset + limit),
      total: filteredFiles.length,
      hasMore: offset + limit < filteredFiles.length,
    };
  });

// Donation procedures
export const getDonationsProcedure = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['completed', 'pending', 'failed']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(({ input }) => {
    let filteredDonations = donations;
    
    if (input.startDate) {
      filteredDonations = filteredDonations.filter(d => d.date >= input.startDate!);
    }
    if (input.endDate) {
      filteredDonations = filteredDonations.filter(d => d.date <= input.endDate!);
    }
    if (input.status) {
      filteredDonations = filteredDonations.filter(d => d.status === input.status);
    }
    
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    
    const total = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    const thisMonth = filteredDonations
      .filter(d => new Date(d.date).getMonth() === new Date().getMonth())
      .reduce((sum, d) => sum + d.amount, 0);
    
    return {
      donations: filteredDonations.slice(offset, offset + limit),
      total: filteredDonations.length,
      hasMore: offset + limit < filteredDonations.length,
      stats: {
        totalAmount: total,
        thisMonth,
        recurring: filteredDonations.filter(d => d.recurring).length,
        average: total / filteredDonations.length || 0,
      }
    };
  });

// Prayer request procedures
export const getPrayerRequestsProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['pending', 'praying', 'answered']).optional(),
    category: z.enum(['healing', 'family', 'finances', 'guidance', 'other']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(({ input }) => {
    let filteredRequests = prayerRequests;
    
    if (input.status) {
      filteredRequests = filteredRequests.filter(r => r.status === input.status);
    }
    if (input.category) {
      filteredRequests = filteredRequests.filter(r => r.category === input.category);
    }
    
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    
    return {
      requests: filteredRequests.slice(offset, offset + limit),
      total: filteredRequests.length,
      hasMore: offset + limit < filteredRequests.length,
    };
  });

export const updatePrayerRequestProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    status: z.enum(['pending', 'praying', 'answered']),
  }))
  .mutation(({ input }) => {
    const requestIndex = prayerRequests.findIndex(r => r.id === input.id);
    if (requestIndex === -1) throw new Error('Prayer request not found');
    
    prayerRequests[requestIndex] = {
      ...prayerRequests[requestIndex],
      status: input.status,
      updatedAt: new Date().toISOString(),
    };
    return prayerRequests[requestIndex];
  });

// Volunteer signup procedures
export const getVolunteerSignupsProcedure = publicProcedure
  .input(z.object({
    eventId: z.string().optional(),
    status: z.enum(['pending', 'approved', 'declined']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }))
  .query(({ input }) => {
    let filteredSignups = volunteerSignups;
    
    if (input.eventId) {
      filteredSignups = filteredSignups.filter(s => s.eventId === input.eventId);
    }
    if (input.status) {
      filteredSignups = filteredSignups.filter(s => s.status === input.status);
    }
    
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    
    return {
      signups: filteredSignups.slice(offset, offset + limit),
      total: filteredSignups.length,
      hasMore: offset + limit < filteredSignups.length,
    };
  });

export const updateVolunteerSignupProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    status: z.enum(['pending', 'approved', 'declined']),
  }))
  .mutation(({ input }) => {
    const signupIndex = volunteerSignups.findIndex(s => s.id === input.id);
    if (signupIndex === -1) throw new Error('Volunteer signup not found');
    
    volunteerSignups[signupIndex] = {
      ...volunteerSignups[signupIndex],
      status: input.status,
    };
    return volunteerSignups[signupIndex];
  });

const mockPosts = new Map<string, any>();
const mockTestimonies = new Map<string, any>();

export const listPostsProcedure = publicProcedure
  .input(z.object({
    category: z.enum(['all', 'general', 'prayer', 'testimony', 'announcement', 'question']).optional(),
    status: z.enum(['all', 'approved', 'pending', 'flagged']).optional(),
    search: z.string().optional(),
  }).optional())
  .query(({ input }) => {
    let posts = Array.from(mockPosts.values());
    
    if (input?.category && input.category !== 'all') {
      posts = posts.filter(p => p.category === input.category);
    }
    
    if (input?.search) {
      posts = posts.filter(p => 
        p.content.toLowerCase().includes(input.search!.toLowerCase()) ||
        p.userName.toLowerCase().includes(input.search!.toLowerCase())
      );
    }
    
    return posts;
  });

export const deletePostProcedure = publicProcedure
  .input(z.object({
    postId: z.string()
  }))
  .mutation(({ input }) => {
    mockPosts.delete(input.postId);
    return { success: true, message: 'Post deleted successfully' };
  });

export const flagPostProcedure = publicProcedure
  .input(z.object({
    postId: z.string(),
    reason: z.string()
  }))
  .mutation(({ input }) => {
    const post = mockPosts.get(input.postId);
    if (!post) throw new Error('Post not found');
    
    post.flagged = true;
    post.flagReason = input.reason;
    mockPosts.set(input.postId, post);
    
    return { success: true, post };
  });

export const approvePostProcedure = publicProcedure
  .input(z.object({
    postId: z.string()
  }))
  .mutation(({ input }) => {
    const post = mockPosts.get(input.postId);
    if (!post) throw new Error('Post not found');
    
    post.flagged = false;
    post.flagReason = null;
    post.approved = true;
    mockPosts.set(input.postId, post);
    
    return { success: true, post };
  });

export const bulkDeletePostsProcedure = publicProcedure
  .input(z.object({
    postIds: z.array(z.string())
  }))
  .mutation(({ input }) => {
    input.postIds.forEach(id => mockPosts.delete(id));
    return { success: true, message: `${input.postIds.length} posts deleted` };
  });

export const listTestimoniesProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['all', 'approved', 'pending']).optional(),
  }).optional())
  .query(({ input }) => {
    let testimonies = Array.from(mockTestimonies.values());
    
    if (input?.status && input.status !== 'all') {
      testimonies = testimonies.filter(t => t.isApproved === (input.status === 'approved'));
    }
    
    return testimonies;
  });

export const approveTestimonyProcedure = publicProcedure
  .input(z.object({
    testimonyId: z.string()
  }))
  .mutation(({ input }) => {
    const testimony = mockTestimonies.get(input.testimonyId);
    if (!testimony) throw new Error('Testimony not found');
    
    testimony.isApproved = true;
    mockTestimonies.set(input.testimonyId, testimony);
    
    return { success: true, testimony };
  });

export const deleteTestimonyProcedure = publicProcedure
  .input(z.object({
    testimonyId: z.string()
  }))
  .mutation(({ input }) => {
    mockTestimonies.delete(input.testimonyId);
    return { success: true, message: 'Testimony deleted successfully' };
  });

// Analytics procedure
export const getAnalyticsProcedure = publicProcedure
  .query(() => {
    return {
      users: {
        total: 150,
        active: 120,
        newThisMonth: 25,
        byRole: {
          admin: 3,
          member: 130,
          guest: 17
        }
      },
      content: {
        sermons: mockContent.sermons.length,
        courses: mockContent.courses.length,
        events: 12,
        totalViews: 2450,
        posts: mockPosts.size,
        testimonies: mockTestimonies.size
      },
      donations: {
        total: donations.reduce((sum, d) => sum + d.amount, 0),
        thisMonth: donations
          .filter(d => new Date(d.date).getMonth() === new Date().getMonth())
          .reduce((sum, d) => sum + d.amount, 0),
        recurring: donations.filter(d => d.recurring).length,
        average: donations.reduce((sum, d) => sum + d.amount, 0) / donations.length || 0
      },
      engagement: {
        activeUsers: 95,
        courseCompletions: 45,
        eventAttendance: 180,
        prayerRequests: prayerRequests.length
      }
    };
  });
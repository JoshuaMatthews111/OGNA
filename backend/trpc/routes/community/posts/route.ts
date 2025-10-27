import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../../create-context';
import type { Post, Comment } from '@/types';

const posts = new Map<string, Post>();

const samplePosts: Post[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    content: 'Praise God! I witnessed an amazing miracle today. A friend who was struggling with their health received complete healing. God is faithful! 🙏',
    type: 'text',
    category: 'testimony',
    likes: ['user-2', 'user-3'],
    comments: [
      {
        id: 'c1',
        userId: 'user-2',
        userName: 'Michael Smith',
        userAvatar: 'https://i.pravatar.cc/150?img=2',
        content: 'Amen! God is so good!',
        likes: ['user-1'],
        replies: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    shares: 3,
    isEdited: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Michael Smith',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    content: 'Please pray for my family. We are going through a difficult time financially. Trusting God for provision.',
    type: 'text',
    category: 'prayer',
    likes: ['user-1', 'user-3', 'user-4'],
    comments: [],
    shares: 0,
    isEdited: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

samplePosts.forEach(p => posts.set(p.id, p));

export const listPostsProcedure = publicProcedure
  .input(z.object({
    category: z.enum(['general', 'prayer', 'testimony', 'announcement', 'question']).optional(),
    groupId: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional()
  }))
  .query(async ({ input }) => {
    let filteredPosts = Array.from(posts.values());
    
    if (input.category) {
      filteredPosts = filteredPosts.filter(p => p.category === input.category);
    }
    
    if (input.groupId) {
      filteredPosts = filteredPosts.filter(p => p.groupId === input.groupId);
    }
    
    filteredPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const offset = input.offset || 0;
    const limit = input.limit || 20;
    
    return {
      posts: filteredPosts.slice(offset, offset + limit),
      total: filteredPosts.length,
      hasMore: offset + limit < filteredPosts.length
    };
  });

export const getPostProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const post = posts.get(input.id);
    if (!post) throw new Error('Post not found');
    return post;
  });

function checkContentForFlags(content: string): { isFlagged: boolean; reason?: string } {
  const lowerContent = content.toLowerCase();
  
  const suspiciousPatterns = [
    { pattern: /\b(suicide|kill myself|end my life|want to die)\b/i, reason: 'Suicidal content detected' },
    { pattern: /\b(xxx|porn|sex|nude|naked)\b/i, reason: '18+ content detected' },
    { pattern: /\b(hate|stupid|idiot|dumb|loser|worthless)\b/i, reason: 'Degrading language detected' },
    { pattern: /\b(drugs|cocaine|heroin|meth)\b/i, reason: 'Drug-related content detected' },
    { pattern: /\b(scam|free money|click here|buy now)\b/i, reason: 'Potential spam detected' },
  ];
  
  for (const { pattern, reason } of suspiciousPatterns) {
    if (pattern.test(lowerContent)) {
      return { isFlagged: true, reason };
    }
  }
  
  return { isFlagged: false };
}

export const createPostProcedure = protectedProcedure
  .input(z.object({
    content: z.string(),
    type: z.enum(['text', 'image', 'video', 'link']),
    mediaUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    linkUrl: z.string().optional(),
    linkTitle: z.string().optional(),
    linkDescription: z.string().optional(),
    category: z.enum(['general', 'prayer', 'testimony', 'announcement', 'question']),
    groupId: z.string().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const moderationCheck = checkContentForFlags(input.content);
    
    const id = `post-${Date.now()}`;
    const post: Post = {
      id,
      userId: ctx.user.id,
      userName: ctx.user.name,
      userAvatar: ctx.user.avatar,
      content: input.content,
      type: input.type,
      mediaUrl: input.mediaUrl,
      videoUrl: input.videoUrl,
      linkUrl: input.linkUrl,
      linkTitle: input.linkTitle,
      linkDescription: input.linkDescription,
      category: input.category,
      groupId: input.groupId,
      likes: [],
      comments: [],
      shares: 0,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    posts.set(id, post);
    
    if (moderationCheck.isFlagged) {
      const g = global as any;
      const flaggedPosts = g.flaggedPosts || new Map();
      flaggedPosts.set(id, {
        postId: id,
        userId: ctx.user.id,
        userName: ctx.user.name,
        content: input.content,
        reason: moderationCheck.reason,
        flaggedAt: new Date().toISOString(),
        reviewed: false
      });
      g.flaggedPosts = flaggedPosts;
    }
    
    return post;
  });

export const updatePostProcedure = protectedProcedure
  .input(z.object({
    postId: z.string(),
    content: z.string()
  }))
  .mutation(async ({ input, ctx }) => {
    const post = posts.get(input.postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== ctx.user.id) throw new Error('Not authorized');
    
    post.content = input.content;
    post.isEdited = true;
    post.updatedAt = new Date().toISOString();
    posts.set(input.postId, post);
    return post;
  });

export const deletePostProcedure = protectedProcedure
  .input(z.object({ postId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const post = posts.get(input.postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== ctx.user.id && ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    posts.delete(input.postId);
    return { success: true };
  });

export const likePostProcedure = protectedProcedure
  .input(z.object({ postId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const post = posts.get(input.postId);
    if (!post) throw new Error('Post not found');
    
    const index = post.likes.indexOf(ctx.user.id);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(ctx.user.id);
    }
    
    posts.set(input.postId, post);
    return post;
  });

export const addCommentProcedure = protectedProcedure
  .input(z.object({
    postId: z.string(),
    content: z.string(),
    parentId: z.string().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const post = posts.get(input.postId);
    if (!post) throw new Error('Post not found');
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: ctx.user.id,
      userName: ctx.user.name,
      userAvatar: ctx.user.avatar,
      content: input.content,
      parentId: input.parentId,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (input.parentId) {
      const parentComment = post.comments.find(c => c.id === input.parentId);
      if (parentComment) {
        parentComment.replies.push(comment);
      }
    } else {
      post.comments.push(comment);
    }
    
    posts.set(input.postId, post);
    return post;
  });

export const deleteCommentProcedure = protectedProcedure
  .input(z.object({
    postId: z.string(),
    commentId: z.string()
  }))
  .mutation(async ({ input, ctx }) => {
    const post = posts.get(input.postId);
    if (!post) throw new Error('Post not found');
    
    post.comments = post.comments.filter(c => {
      if (c.id === input.commentId) {
        return c.userId === ctx.user.id || ctx.user.role === 'admin';
      }
      c.replies = c.replies.filter(r => r.id !== input.commentId);
      return true;
    });
    
    posts.set(input.postId, post);
    return post;
  });

export const getFlaggedPostsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    
    const g = global as any;
    const flaggedPosts = g.flaggedPosts || new Map();
    return Array.from(flaggedPosts.values()).filter((f: any) => !f.reviewed);
  });

export const reviewFlaggedPostProcedure = protectedProcedure
  .input(z.object({
    postId: z.string(),
    action: z.enum(['approve', 'remove'])
  }))
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Not authorized');
    }
    
    const g = global as any;
    const flaggedPosts = g.flaggedPosts || new Map();
    const flagged = flaggedPosts.get(input.postId);
    
    if (!flagged) throw new Error('Flagged post not found');
    
    if (input.action === 'remove') {
      posts.delete(input.postId);
    }
    
    flagged.reviewed = true;
    flagged.reviewedAt = new Date().toISOString();
    flagged.reviewedBy = ctx.user.id;
    flagged.action = input.action;
    flaggedPosts.set(input.postId, flagged);
    g.flaggedPosts = flaggedPosts;
    
    return { success: true };
  });

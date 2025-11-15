import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const createPost = mutation({
  args: {
    imageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db.insert("posts", {
      imageId: args.imageId,
      userId,
      caption: args.caption,
    });
  },
});

export const getGlobalStream = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").take(50);
    
    return await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const imageUrl = await ctx.storage.getUrl(post.imageId);
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        
        const currentUserId = await getAuthUserId(ctx);
        const isLiked = currentUserId 
          ? likes.some(like => like.userId === currentUserId)
          : false;
        
        return {
          ...post,
          user: user ? { name: user.name, email: user.email } : null,
          imageUrl,
          likeCount: likes.length,
          isLiked,
        };
      })
    );
  },
});

export const getUserPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    return await Promise.all(
      posts.map(async (post) => {
        const imageUrl = await ctx.storage.getUrl(post.imageId);
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        
        return {
          ...post,
          imageUrl,
          likeCount: likes.length,
        };
      })
    );
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== userId) {
      throw new Error("Post not found or not authorized");
    }
    
    // Delete all likes for this post
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }
    
    // Delete the post
    await ctx.db.delete(args.postId);
    
    // Delete the image from storage
    await ctx.storage.delete(post.imageId);
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) => 
        q.eq("userId", userId).eq("postId", args.postId)
      )
      .unique();
    
    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      return false;
    } else {
      // Like
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId,
      });
      return true;
    }
  },
});

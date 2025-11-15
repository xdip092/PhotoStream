import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  posts: defineTable({
    imageId: v.id("_storage"),
    userId: v.id("users"),
    caption: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  
  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId", "postId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

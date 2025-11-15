import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Heart } from "lucide-react";

export function StreamTab() {
  const posts = useQuery(api.posts.getGlobalStream);
  const toggleLike = useMutation(api.posts.toggleLike);

  const handleLike = async (postId: Id<"posts">) => {
    await toggleLike({ postId });
  };

  if (posts === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No photos in the stream yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Post Header */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {post.user?.name?.[0] || post.user?.email?.[0] || "?"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {post.user?.name || post.user?.email || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(post._creationTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="aspect-square bg-gray-100">
              <img
                src={post.imageUrl}
                alt={post.caption || "Post image"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="p-4">
            <div className="flex items-center space-x-4 mb-2">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center space-x-1 transition-colors ${
                  post.isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart
                  size={20}
                  className={post.isLiked ? "fill-current" : ""}
                />
                <span className="text-sm font-medium">{post.likeCount}</span>
              </button>
            </div>

            {post.caption && (
              <p className="text-gray-900">{post.caption}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Trash2, Heart } from "lucide-react";
import { toast } from "sonner";

export function MyPhotosTab() {
  const posts = useQuery(api.posts.getUserPosts);
  const deletePost = useMutation(api.posts.deletePost);

  const handleDelete = async (postId: Id<"posts">) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      try {
        await deletePost({ postId });
        toast.success("Photo deleted successfully");
      } catch (error) {
        toast.error("Failed to delete photo");
      }
    }
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
        <p className="text-gray-500 text-lg">You haven't shared any photos yet.</p>
        <p className="text-gray-400 mt-2">Upload your first photo to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Photos</h2>
        <p className="text-gray-500">{posts.length} photo{posts.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Image */}
            {post.imageUrl && (
              <div className="aspect-square bg-gray-100 relative group">
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Your photo"}
                  className="w-full h-full object-cover"
                />
                
                {/* Delete Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Post Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Heart size={16} />
                  <span className="text-sm">{post.likeCount}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(post._creationTime).toLocaleDateString()}
                </p>
              </div>

              {post.caption && (
                <p className="text-gray-900 text-sm line-clamp-2">{post.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

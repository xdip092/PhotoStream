import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { StreamTab } from "./components/StreamTab";
import { MyPhotosTab } from "./components/MyPhotosTab";
import { UploadTab } from "./components/UploadTab";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">PhotoStream</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [activeTab, setActiveTab] = useState<"stream" | "upload" | "photos">("stream");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Unauthenticated>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Welcome to PhotoStream</h1>
          <p className="text-xl text-secondary mb-8">Share your photos with the world</p>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Welcome back, {loggedInUser?.name || loggedInUser?.email}!
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab("stream")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === "stream"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Stream
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === "upload"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === "photos"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Photos
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "stream" && <StreamTab />}
        {activeTab === "upload" && <UploadTab />}
        {activeTab === "photos" && <MyPhotosTab />}
      </Authenticated>
    </div>
  );
}

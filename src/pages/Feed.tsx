import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send } from "lucide-react";
import Navbar from "@/components/Navbar";

const Feed = () => {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Load feed posts
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      console.log('Loading feed with token:', token.substring(0, 20) + '...');

      const response = await fetch('http://localhost:5000/api/posts/feed', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Feed response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Feed data:', data);

      if (data.success) {
        setPosts(data.data.posts || []);
        console.log('Posts loaded:', data.data.posts?.length || 0);
      } else {
        console.error('Feed API error:', data.message);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
      // Set empty posts array on error
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newPost,
          type: 'general'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPosts([data.data, ...posts]);
        setNewPost("");
        alert('Post created successfully!');
      } else {
        alert(`Failed to create post: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Community <span className="text-primary">Feed</span>
        </h1>

        {/* Create Post */}
        <Card className="mb-8 border-border/50 bg-card/80">
          <CardHeader>
            <h2 className="text-lg font-semibold">Share with the Community</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts, ask questions, or inspire others..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none bg-background/50 border-border/50"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
                <Button 
                  onClick={handlePostSubmit}
                  disabled={!newPost.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share something with the community!
              </p>
              <p className="text-sm text-muted-foreground">
                Create a post above to get started.
              </p>
            </div>
          ) : (
            posts.map((post) => (
            <Card key={post._id} className="border-border/50 bg-card/80 hover:bg-card transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={post.author?.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.author?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{post.author?.fullName || 'Unknown User'}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.author?.role === 'imaam' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-secondary/50 text-secondary-foreground'
                      }`}>
                        {post.author?.role || 'Student'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{post.timeAgo || 'Just now'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
                
                {post.hasImage && (
                  <div className="mb-4 bg-muted/30 rounded-lg h-48 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center space-x-6 pt-4 border-t border-border/30">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                    <Heart className="w-4 h-4 mr-2" />
                    {post.likesCount || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.commentsCount || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Comment Input */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">U</AvatarFallback>
                    </Avatar>
                    <Input 
                      placeholder="Write a comment..."
                      className="flex-1 bg-background/50 border-border/50 focus:border-primary"
                    />
                    <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
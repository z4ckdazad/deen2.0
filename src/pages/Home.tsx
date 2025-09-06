import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, MessageCircle, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-islamic.jpg";

const Home = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Islamic Learning",
      description: "Connect with qualified imaam and enhance your Islamic knowledge through structured courses and discussions."
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Build meaningful connections with fellow students and respected Islamic teachers in your area."
    },
    {
      icon: MessageCircle,
      title: "Interactive Feed",
      description: "Share insights, ask questions, and engage in thoughtful discussions about Islamic teachings."
    },
    {
      icon: Star,
      title: "Quality Content",
      description: "Access verified Islamic content and teachings from certified imaam and scholars."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-dark opacity-80" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                DeenVerse
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Reconnect. Reflect. Reunite.
            </p>
            <p className="text-lg text-foreground/80 mb-10 max-w-3xl mx-auto">
              Join our Islamic learning community where students and imaam come together to share knowledge, 
              grow spiritually, and build lasting connections in their journey of faith.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-golden">
                  Get Started
                </Button>
              </Link>
              <Link to="/feed">
                <Button variant="outline" size="lg" className="border-primary/20 text-foreground hover:bg-primary/10">
                  Explore Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Empowering Islamic{" "}
              <span className="text-primary">Learning</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover the features that make DeenVerse the premier platform for Islamic education and community building.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border/50 bg-card/80 hover:bg-card transition-all duration-300 hover:shadow-golden/30 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Begin Your{" "}
              <span className="text-primary">Journey?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students and imaam who are already part of our thriving Islamic learning community.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-golden">
                Join DeenVerse Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
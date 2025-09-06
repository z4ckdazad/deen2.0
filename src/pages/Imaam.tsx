import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Mail, Star } from "lucide-react";
import Navbar from "@/components/Navbar";

const Imaam = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [sortBy, setSortBy] = useState("name");

  const [imaamList] = useState([
    {
      id: 1,
      name: "Imam Abdullah Rahman",
      email: "abdullah@deenverse.com",
      islamicProfile: "Hafiz & Mufti",
      specialization: ["Quran Recitation", "Islamic Law"],
      students: 45,
      rating: 4.9,
      avatar: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Imam Hassan Al-Qureshi",
      email: "hassan@deenverse.com",
      islamicProfile: "Islamic Scholar",
      specialization: ["Hadith Studies", "Arabic Language"],
      students: 32,
      rating: 4.8,
      avatar: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Imam Muhammad Ali",
      email: "muhammad@deenverse.com",
      islamicProfile: "Qari & Mufti",
      specialization: ["Tajweed", "Fiqh"],
      students: 28,
      rating: 4.9,
      avatar: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Imam Omar Farouk",
      email: "omar@deenverse.com",
      islamicProfile: "Islamic Historian",
      specialization: ["Islamic History", "Tafseer"],
      students: 38,
      rating: 4.7,
      avatar: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Imam Ahmed Bin Hanbal",
      email: "ahmed@deenverse.com",
      islamicProfile: "Hafiz",
      specialization: ["Quran Memorization", "Youth Programs"],
      students: 52,
      rating: 4.8,
      avatar: "/placeholder.svg"
    },
    {
      id: 6,
      name: "Imam Yusuf Al-Qaradawi",
      email: "yusuf@deenverse.com",
      islamicProfile: "Senior Scholar",
      specialization: ["Contemporary Issues", "Islamic Ethics"],
      students: 41,
      rating: 4.9,
      avatar: "/placeholder.svg"
    }
  ]);

  const filteredImaam = imaamList
    .filter((imam) => {
      if (searchBy === "name") {
        return imam.name.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchBy === "profile") {
        return imam.islamicProfile.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "students") {
        return b.students - a.students;
      } else if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return 0;
    });

  const handleSearch = () => {
    // Search is already handled by the filtering above
    console.log("Searching for:", searchTerm, "by:", searchBy);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Find Your <span className="text-primary">Imaam</span>
        </h1>

        {/* Search and Filter Section */}
        <Card className="mb-8 border-border/50 bg-card/80">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">Search</label>
                <div className="flex gap-2">
                  <Select value={searchBy} onValueChange={setSearchBy}>
                    <SelectTrigger className="w-[140px] bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="profile">Islamic Profile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Enter search term..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-background/50"
                  />
                  <Button onClick={handleSearch} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Search className="w-4 h-4 mr-2" />
                    Find
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredImaam.length} of {imaamList.length} imaam
          </p>
        </div>

        {/* Imaam Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImaam.map((imam) => (
            <Card key={imam.id} className="border-border/50 bg-card/80 hover:bg-card transition-all duration-300 hover:shadow-golden/30 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={imam.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {imam.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {imam.name}
                    </h3>
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-muted-foreground">
                        {imam.rating} ({imam.students} students)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {imam.email}
                  </div>
                  
                  <div>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {imam.islamicProfile}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {imam.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-border/50">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    Connect with Imam
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredImaam.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No imaam found matching your search criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSearchBy("name");
              }}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Imaam;
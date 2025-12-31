"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  User, 
  Save, 
  Check, 
  Loader2, 
  Shield,
  BookOpen,
  Target,
  Sparkles,
  Camera,
  Calendar,
  School,
  Briefcase,
  Heart,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const educationLevels = [
  { value: "middle-school", label: "Middle School" },
  { value: "high-school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "masters", label: "Master's Degree" },
  { value: "phd", label: "PhD" },
  { value: "professional", label: "Professional" },
];

const learningStyles = [
  { value: "visual", label: "Visual", desc: "Diagrams & images" },
  { value: "reading", label: "Reading", desc: "Text & notes" },
  { value: "practical", label: "Practical", desc: "Examples & exercises" },
  { value: "conceptual", label: "Conceptual", desc: "Theory & concepts" },
];

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "Programming", "Web Development", "Data Science", "AI/ML",
  "English", "Literature", "History", "Geography", "Economics",
  "Business", "Accounting", "Art & Design", "Music", "Psychology"
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState(session?.user?.name || "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [major, setMajor] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [occupation, setOccupation] = useState("");
  const [educationLevel, setEducationLevel] = useState("undergraduate");
  const [learningStyle, setLearningStyle] = useState("practical");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Programming", "Mathematics"]);
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [studyGoal, setStudyGoal] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    
    // Load from database only
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          if (user) {
            if (user.image) setProfileImage(user.image);
            if (user.name) setName(user.name);
            if (user.dateOfBirth) setDateOfBirth(user.dateOfBirth);
            if (user.school) setSchoolName(user.school);
            if (user.major) setMajor(user.major);
            if (user.yearOfStudy) setYearOfStudy(user.yearOfStudy);
            if (user.occupation) setOccupation(user.occupation);
            if (user.educationLevel) setEducationLevel(user.educationLevel);
            if (user.learningStyle) setLearningStyle(user.learningStyle);
            if (user.subjects?.length) setSelectedSubjects(user.subjects);
            if (user.preferredLanguage) setPreferredLanguage(user.preferredLanguage);
            if (user.studyGoal) setStudyGoal(user.studyGoal);
            if (user.hobbies) setHobbies(user.hobbies);
          }
        }
      } catch (e) {
        console.error("Failed to load from database:", e);
      }
    };

    loadSettings();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const settingsData = { 
      name,
      profileImage,
      dateOfBirth,
      school: schoolName, // Use 'school' for consistency with onboarding
      schoolName,
      major,
      yearOfStudy,
      occupation,
      educationLevel,
      learningStyle,
      subjects: selectedSubjects,
      preferredLanguage,
      studyGoal,
      hobbies,
    };
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });
      if (res.ok) {
        // Trigger session update to refetch from database
        await update();
        // Dispatch event to notify sidebar to refetch profile
        window.dispatchEvent(new CustomEvent("profile-updated"));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        toast({ title: "Profile saved successfully" });
      } else {
        const error = await res.json();
        console.error("Save error response:", error);
        throw new Error(error.error || "Failed to save");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMessage = error?.message || error?.error || "Failed to save";
      toast({ 
        title: errorMessage, 
        description: error?.details ? JSON.stringify(error.details) : undefined,
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 lg:left-[260px] bg-white overflow-y-auto transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-500">Personalize your AI learning experience</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <User className="w-16 h-16 text-blue-300" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  {profileImage && (
                    <button
                      onClick={() => setProfileImage(null)}
                      className="absolute top-0 right-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{name || "Your Name"}</h3>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
                <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-50 rounded text-xs text-blue-600">
                  <Shield className="w-3 h-3" />
                  Verified
                </div>
        </div>
      </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subjects</span>
                  <span className="text-sm font-semibold text-blue-600">{selectedSubjects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Learning Style</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">{learningStyle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Level</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">{educationLevel.replace("-", " ")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Personal Information</h2>
                </div>
              </div>
              <div className="p-4 grid sm:grid-cols-2 gap-4">
            <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="h-10 border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="h-10 pl-10 border-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Preferred Language</Label>
                  <Input
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    placeholder="e.g., English, Myanmar"
                    className="h-10 border-gray-200"
              />
            </div>
            <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Hobbies & Interests</Label>
              <div className="relative">
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                      value={hobbies}
                      onChange={(e) => setHobbies(e.target.value)}
                      placeholder="Reading, Gaming, Music..."
                      className="h-10 pl-10 border-gray-200"
                />
                  </div>
                </div>
              </div>
            </div>

            {/* Education Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Education</h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">School / University</Label>
                    <Input
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g., University of Yangon"
                      className="h-10 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Major / Field of Study</Label>
                    <Input
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g., Computer Science"
                      className="h-10 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Year of Study</Label>
                    <Input
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      placeholder="e.g., 3rd Year, Graduated"
                      className="h-10 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Occupation</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="Student, Developer, Teacher..."
                        className="h-10 pl-10 border-gray-200"
                      />
            </div>
          </div>
        </div>

                {/* Education Level */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Education Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {educationLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setEducationLevel(level.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          educationLevel === level.value
                            ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Learning Preferences</h2>
            </div>
          </div>
              <div className="p-4 space-y-4">
                {/* Learning Style */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Learning Style</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {learningStyles.map((style) => (
                <button
                        key={style.value}
                        onClick={() => setLearningStyle(style.value)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          learningStyle === style.value
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/20"
                      : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                  }`}
                >
                        <span className={`text-sm font-medium block ${learningStyle === style.value ? "text-blue-700" : "text-gray-700"}`}>
                          {style.label}
                        </span>
                        <span className="text-xs text-gray-400">{style.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects of Interest */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Subjects of Interest</h2>
                  <span className="text-xs text-gray-400 ml-auto">{selectedSubjects.length} selected</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedSubjects.includes(subject)
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {subject}
                </button>
              ))}
            </div>
          </div>
        </div>

            {/* Study Goal */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Study Goal</h2>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={studyGoal}
                  onChange={(e) => setStudyGoal(e.target.value)}
                  placeholder="Tell us about your learning goals... e.g., I want to become a full-stack developer in 6 months, prepare for university entrance exams, improve my English speaking skills..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">AI will tailor responses to help you achieve your goals</p>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-base shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          {isSaving ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving...</>
          ) : saved ? (
                <><Check className="mr-2 h-5 w-5" />Saved Successfully</>
          ) : (
                <><Save className="mr-2 h-5 w-5" />Save Profile</>
          )}
        </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

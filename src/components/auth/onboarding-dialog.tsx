"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, User, GraduationCap, BookOpen, Loader2, Brain, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingDialogProps {
  isOpen: boolean;
  onComplete: () => void;
  userEmail: string;
  userName?: string;
  userImage?: string;
}

export function OnboardingDialog({ isOpen, onComplete, userEmail, userName, userImage }: OnboardingDialogProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form data
  const [formData, setFormData] = useState({
    name: userName || "",
    educationLevel: "",
    school: "",
    major: "",
    learningStyle: "",
    subjects: [] as string[],
    studyGoal: "",
  });

  useEffect(() => {
    if (userName) {
      setFormData(prev => ({ ...prev, name: userName }));
    }
  }, [userName]);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      // Save only the name to database
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });
      
      if (res.ok) {
        // Mark onboarding as complete (UI state only)
        localStorage.setItem("onboardingComplete", "true");
        toast({ title: "Welcome to Kabyar! 🎉" });
        onComplete();
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save to database
      const profileData = {
        name: formData.name,
        educationLevel: formData.educationLevel,
        school: formData.school,
        schoolName: formData.school, // Also save as schoolName for settings compatibility
        major: formData.major,
        learningStyle: formData.learningStyle,
        subjects: formData.subjects,
        studyGoal: formData.studyGoal,
      };

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        // Mark onboarding as complete (UI state only)
        localStorage.setItem("onboardingComplete", "true");
        toast({ title: "Welcome to Kabyar! 🎉" });
        onComplete();
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "English",
    "History", "Computer Science", "Economics", "Business",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md p-6" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Step 1: Name Only */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <DialogHeader className="space-y-2 mb-6">
              <DialogTitle className="text-2xl font-bold">Welcome to Kabyar!</DialogTitle>
              <DialogDescription className="text-gray-500">
                What should we call you?
              </DialogDescription>
            </DialogHeader>

            <div className="w-full mb-6">
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter your name"
                className="text-center text-lg h-12"
                autoFocus
              />
            </div>

            <Button 
              onClick={handleNext} 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-medium"
              disabled={!formData.name.trim()}
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2: AI Personalization Intro */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            
            <DialogHeader className="space-y-2 mb-4">
              <DialogTitle className="text-xl font-bold">
                Hey {formData.name}! 👋
              </DialogTitle>
              <DialogDescription className="text-gray-500 leading-relaxed">
                To give you the best AI learning experience, we&apos;d love to know a bit about your education. This helps our AI personalize responses just for you!
              </DialogDescription>
            </DialogHeader>

            <div className="w-full space-y-4 mb-6 text-left">
              <div>
                <Label className="text-sm font-medium">Education Level</Label>
                <Select value={formData.educationLevel} onValueChange={(v) => handleChange("educationLevel", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle_school">Middle School</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="a_level">A-Level</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">School / University</Label>
                <Input
                  value={formData.school}
                  onChange={(e) => handleChange("school", e.target.value)}
                  placeholder="Where do you study?"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Major / Field</Label>
                <Input
                  value={formData.major}
                  onChange={(e) => handleChange("major", e.target.value)}
                  placeholder="e.g., Computer Science, Business..."
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip
              </Button>
              <Button 
                onClick={handleNext} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Learning Preferences */}
        {step === 3 && (
          <div className="flex flex-col animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Almost Done!</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  One more step to personalize your AI
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-sm font-medium">Learning Style</Label>
                <Select value={formData.learningStyle} onValueChange={(v) => handleChange("learningStyle", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="How do you learn best?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual (images, diagrams)</SelectItem>
                    <SelectItem value="reading">Reading/Writing</SelectItem>
                    <SelectItem value="examples">Examples & Practice</SelectItem>
                    <SelectItem value="stepbystep">Step-by-step explanations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Subjects of Interest</Label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.subjects.includes(subject)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Study Goal</Label>
                <Textarea
                  value={formData.studyGoal}
                  onChange={(e) => handleChange("studyGoal", e.target.value)}
                  placeholder="What do you want to achieve?"
                  rows={2}
                  className="mt-1.5 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Started
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


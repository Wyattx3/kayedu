"use client";

import { useState, useEffect } from "react";
import { 
  Crown, 
  Sparkles, 
  Check, 
  Coins,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Get started with basic features",
    icon: <Coins className="w-6 h-6" />,
    features: [
      { text: "50 daily credits", included: true },
      { text: "Fast & Normal AI models", included: true },
      { text: "All 8 learning tools", included: true },
      { text: "Basic support", included: true },
      { text: "Ads included", included: false },
      { text: "Super Smart models", included: false },
    ],
    buttonText: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: 3,
    period: "month",
    description: "Perfect for students",
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    features: [
      { text: "3,500 monthly credits", included: true },
      { text: "All AI models", included: true },
      { text: "Super Smart access", included: true },
      { text: "Ads-free", included: true },
      { text: "Priority support", included: true },
      { text: "Early access features", included: true },
    ],
    buttonText: "Upgrade to Pro",
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 9,
    period: "month",
    description: "For power users",
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      { text: "Unlimited usage", included: true },
      { text: "No credit limits", included: true },
      { text: "All models unlimited", included: true },
      { text: "Ads-free", included: true },
      { text: "Priority support", included: true },
      { text: "Beta features access", included: true },
    ],
    buttonText: "Go Unlimited",
  },
];

export default function PlansPage() {
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    async function fetchPlan() {
      try {
        const res = await fetch("/api/user/credits");
        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data.plan || "free");
        }
      } catch {
        // Default to free
      }
    }
    fetchPlan();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free" || planId === currentPlan) return;
    
    setIsLoading(planId);
    
    // TODO: Integrate with payment provider
    toast({
      title: "Coming Soon!",
      description: "Payment integration will be available soon.",
    });
    
    setIsLoading(null);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-full py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
          <Crown className="w-4 h-4" />
          Choose Your Plan
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Unlock Your Full Potential
        </h1>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Choose the plan that fits your learning needs
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 bg-white p-5 transition-all duration-300 hover:shadow-lg ${
              plan.popular ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2" : "border-gray-200"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                POPULAR
              </div>
            )}

            {/* Plan Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                plan.id === "free" ? "bg-gray-100 text-gray-600" : "bg-blue-600 text-white"
              }`}>
                {plan.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2.5 mb-5">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  {feature.included ? (
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">✕</span>
                    </div>
                  )}
                  <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Button */}
            <Button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={plan.id === "free" || plan.id === currentPlan || isLoading === plan.id}
              className={`w-full h-10 rounded-xl font-medium transition-all ${
                plan.id === currentPlan
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : plan.id === "free"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLoading === plan.id ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : plan.id === currentPlan ? (
                "Current Plan"
              ) : (
                <span className="flex items-center gap-2">
                  {plan.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-12">
        <h2 className="text-lg font-bold text-center text-gray-900 mb-6">
          FAQ
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1">What are credits?</h3>
            <p className="text-sm text-gray-500">
              Credits are used for AI tools. About 3 credits per 1000 words.
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1">Can I cancel anytime?</h3>
            <p className="text-sm text-gray-500">
              Yes, cancel anytime. Access continues until billing period ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard,
  DollarSign,
  Banknote,
  TrendingUp,
  Rocket,
  Globe,
  Store,
  RefreshCw,
  Smartphone,
  ShoppingBag,
  Utensils,
  Briefcase,
  Heart,
  Package,
  Building2,
  MapPin,
  Globe2,
  Map,
  Coins,
  CircleCheck,
  AlertCircle,
  XCircle,
  Sparkle,
  Plug,
  Wrench,
  Settings
} from "lucide-react";
import { providers } from "@/data/providers";
import { useToast } from "@/hooks/use-toast";
import { submitQuizLead } from "@/app/actions/quiz";

interface QuizAnswers {
  monthlyVolume: string;
  businessType: string;
  industry: string;
  internationalPayments: string;
  averageTransaction: string;
  priority: string[];
  fullName: string;
  email: string;
  phone: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type?: "select";
  multiSelect?: boolean;
  showIcons?: boolean;
  options: Array<{
    value: string;
    label: string;
    icon: any;
  }>;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "businessType",
    question: "How do you primarily accept payments?",
    options: [
      { value: "in-person", label: "In-person", icon: Store },
      { value: "online", label: "Online", icon: Globe },
      { value: "both", label: "Both", icon: RefreshCw },
    ],
  },
  {
    id: "monthlyVolume",
    question: "What's your monthly payment processing volume?",
    showIcons: false,
    options: [
      { value: "under-50k", label: "Under $50,000", icon: DollarSign },
      { value: "50k-200k", label: "$50,000 - $200,000", icon: TrendingUp },
      { value: "over-200k", label: "Over $200,000", icon: Banknote },
    ],
  },
  {
    id: "industry",
    question: "What industry is your business in?",
    type: "select",
    options: [
      { value: "retail", label: "Retail", icon: ShoppingBag },
      { value: "restaurants", label: "Restaurants & Food Service", icon: Utensils },
      { value: "professional", label: "Professional Services", icon: Briefcase },
      { value: "healthcare", label: "Healthcare", icon: Heart },
      { value: "ecommerce", label: "E-commerce", icon: Package },
      { value: "automotive", label: "Automotive & Car Services", icon: Building2 },
      { value: "beauty", label: "Beauty & Personal Care", icon: Building2 },
      { value: "construction", label: "Construction & Home Services", icon: Building2 },
      { value: "education", label: "Education & Training", icon: Building2 },
      { value: "entertainment", label: "Entertainment & Events", icon: Building2 },
      { value: "fitness", label: "Fitness & Wellness", icon: Building2 },
      { value: "hospitality", label: "Hospitality & Lodging", icon: Building2 },
      { value: "legal", label: "Legal Services", icon: Building2 },
      { value: "logistics", label: "Logistics & Transportation", icon: Building2 },
      { value: "manufacturing", label: "Manufacturing", icon: Building2 },
      { value: "marketing", label: "Marketing & Advertising", icon: Building2 },
      { value: "nonprofit", label: "Nonprofit & Charity", icon: Building2 },
      { value: "real-estate", label: "Real Estate", icon: Building2 },
      { value: "technology", label: "Technology & Software", icon: Building2 },
      { value: "travel", label: "Travel & Tourism", icon: Building2 },
      { value: "other", label: "Other", icon: Building2 },
    ],
  },
  {
    id: "internationalPayments",
    question: "Do you need to accept international payments?",
    options: [
      { value: "no", label: "No, US only", icon: MapPin },
      { value: "yes", label: "Yes, regularly", icon: Globe2 },
      { value: "occasionally", label: "Occasionally", icon: Map },
    ],
  },
  {
    id: "averageTransaction",
    question: "What's your average transaction size?",
    options: [
      { value: "0-50", label: "Under $50", icon: Coins },
      { value: "50-200", label: "$50 - $200", icon: DollarSign },
      { value: "200-1000", label: "$200 - $1,000", icon: Banknote },
      { value: "1000+", label: "Over $1,000", icon: TrendingUp },
    ],
  },
  {
    id: "priority",
    question: "What's most important to you?",
    multiSelect: true,
    options: [
      { value: "low-fees", label: "Low fees", icon: Coins },
      { value: "fast-setup", label: "Fast setup", icon: Rocket },
      { value: "support", label: "Great support", icon: Heart },
    ],
  },
];

interface QuizContentProps {
  onComplete?: () => void;
  showBackButton?: boolean;
}

const QuizContent = ({ onComplete, showBackButton = true }: QuizContentProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);

  const isContactStep = currentStep === quizQuestions.length;
  const totalSteps = quizQuestions.length + 1;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleMultiAnswer = (questionId: string, value: string) => {
    const currentValues = (answers[questionId as keyof QuizAnswers] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setAnswers({ ...answers, [questionId]: newValues });
  };

  const handleNext = () => {
    if (currentStep < quizQuestions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingLead(true);

    try {
      const recommendation = getRecommendation();

      const result = await submitQuizLead({
        fullName: answers.fullName || "",
        email: answers.email || "",
        phone: answers.phone || "",
        monthlyVolume: answers.monthlyVolume as string | undefined,
        businessType: answers.businessType as string | undefined,
        industry: answers.industry as string | undefined,
        internationalPayments: answers.internationalPayments as string | undefined,
        averageTransaction: answers.averageTransaction as string | undefined,
        priority: Array.isArray(answers.priority) ? answers.priority : undefined,
        recommendedProvider: recommendation.name,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save");
      }

      setShowResult(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingLead(false);
    }
  };

  const getRecommendation = () => {
    const { monthlyVolume, businessType, priority } = answers;
    
    if (monthlyVolume === "over-200k") {
      return providers.find(p => p.name === "Worldpay") || providers[0];
    }
    
    if (businessType === "in-person") {
      return providers.find(p => p.name === "Clover") || providers[0];
    }
    
    return providers[0];
  };

  const currentQuestion = quizQuestions[currentStep];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id as keyof QuizAnswers] : undefined;
  const canProceed = isContactStep 
    ? (answers.fullName && answers.email) 
    : currentQuestion?.multiSelect 
      ? Array.isArray(currentAnswer) && currentAnswer.length > 0
      : currentAnswer;

  if (showResult) {
    const recommendation = getRecommendation();
    const allProviders = [...providers].sort((a, b) => b.rating - a.rating);
    const alternatives = allProviders.filter(p => p.id !== recommendation.id).slice(0, 2);
    
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Main Recommendation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8 rounded-2xl border border-primary/20 text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              {recommendation.logo && (
                <div className="flex justify-center">
                  <img 
                    src={recommendation.logo} 
                    alt={`${recommendation.name} logo`}
                    className="h-12 sm:h-14 md:h-16 object-contain"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{recommendation.name}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{recommendation.tagline}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-left max-w-md mx-auto">
              {recommendation.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm sm:text-base text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => window.open(recommendation.url, '_blank')} 
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
            >
              Visit {recommendation.name}
              <CreditCard className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground text-center">Other Options</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {alternatives.map((provider) => (
              <div 
                key={provider.id}
                className="bg-accent/30 p-4 rounded-xl border hover:border-primary/30 transition-all group"
              >
                <div className="space-y-2.5">
                  <div>
                    <h5 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{provider.name}</h5>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{provider.tagline}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    {provider.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => window.open(provider.url, '_blank')}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 h-2 sm:h-3 bg-accent rounded-full overflow-hidden sm:shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-muted-foreground min-w-[40px] sm:min-w-[50px] text-right">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {/* Question */}
      {!isContactStep ? (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          <h3 className="text-base sm:text-xl font-bold text-foreground leading-snug sm:leading-relaxed">
            {currentQuestion.question}
          </h3>
          
          {currentQuestion.type === "select" ? (
            <div className="space-y-2">
              <Select
                value={(currentAnswer as string) || ""}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              >
                <SelectTrigger className="w-full h-12 text-sm sm:text-base">
                  <SelectValue placeholder="Select your industry..." />
                </SelectTrigger>
                <SelectContent className="bg-background border-border max-h-[300px] z-50">
                  {currentQuestion.options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : currentQuestion.multiSelect ? (
            <div className={`grid gap-3 sm:gap-4 grid-cols-3`}>
              {currentQuestion.options.map((option) => {
                const IconComponent = option.icon;
                const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option.value);
                
                return (
                  <label 
                    key={option.value}
                    className={`
                      group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl border-2 
                      transition-all duration-300 cursor-pointer min-h-[100px] sm:min-h-[130px]
                      ${isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/30'
                      }
                    `}
                    onClick={() => handleMultiAnswer(currentQuestion.id, option.value)}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    )}
                    <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-center leading-snug">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <RadioGroup
              value={(currentAnswer as string) || ""}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              className={`grid gap-3 sm:gap-4 ${
                currentQuestion.options.length === 3 
                  ? 'grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {currentQuestion.options.map((option) => {
                const IconComponent = option.icon;
                const isCardStyle = currentQuestion.options.length === 3;
                const showIcons = currentQuestion.showIcons !== false;
                
                return isCardStyle ? (
                  <label 
                    key={option.value}
                    htmlFor={option.value}
                    className={`
                      group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl border-2 
                      transition-all duration-300 cursor-pointer min-h-[100px] sm:min-h-[130px]
                      ${currentAnswer === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/30'
                      }
                    `}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    {currentAnswer === option.value && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    )}
                    {showIcons && <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />}
                    <span className="text-xs sm:text-sm font-medium text-center leading-snug">
                      {option.label}
                    </span>
                  </label>
                ) : (
                  <label 
                    key={option.value}
                    htmlFor={option.value}
                    className={`
                      group relative flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 
                      transition-all duration-300 cursor-pointer
                      ${currentAnswer === option.value 
                        ? 'border-primary bg-primary/5 scale-[1.01] sm:scale-[1.02] quiz-card-selected' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/30 quiz-option-hover'
                      }
                    `}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="flex-shrink-0" />
                    <span className="flex-1 text-xs sm:text-sm font-medium leading-snug">
                      {option.label}
                    </span>
                    {currentAnswer === option.value && (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 sm:animate-scale-in" />
                    )}
                  </label>
                );
              })}
            </RadioGroup>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="animate-fade-in">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-border">
            <div className="text-center mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Get Your Free Quote
              </h3>
              <p className="text-sm text-muted-foreground mt-2">See which provider is best for your business</p>
            </div>
            
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="fullName"
                  value={answers.fullName || ""}
                  onChange={(e) => handleAnswer("fullName", e.target.value)}
                  required
                  className="h-11 bg-background"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={answers.email || ""}
                  onChange={(e) => handleAnswer("email", e.target.value)}
                  required
                  className="h-11 bg-background"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium">Phone <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  value={answers.phone || ""}
                  onChange={(e) => handleAnswer("phone", e.target.value)}
                  className="h-11 bg-background"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-border/50">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary">J</div>
                <div className="w-7 h-7 rounded-full bg-green-500/20 border-2 border-background flex items-center justify-center text-xs font-medium text-green-600">M</div>
                <div className="w-7 h-7 rounded-full bg-orange-500/20 border-2 border-background flex items-center justify-center text-xs font-medium text-orange-600">S</div>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">500+</span> businesses found their perfect match
              </p>
            </div>
          </div>
        </form>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
        {isContactStep ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!canProceed || isSavingLead} 
            className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold w-full"
          >
            {isSavingLead ? "Saving..." : "Get My Recommendation"}
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          </Button>
        ) : (
          <>
            {showBackButton && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold"
              >
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm font-semibold ml-auto"
            >
              Next
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizContent;

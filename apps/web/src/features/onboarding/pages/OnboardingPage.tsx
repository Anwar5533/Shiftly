/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-misused-promises -- TODO(RC3): */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronRight, ChevronLeft, Loader2, MapPin, Briefcase, User } from 'lucide-react';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const personalDetailsSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  dateOfBirth: z.string().optional(),
});

const skillsSchema = z.object({
  industry: z.string().min(1, 'Please select an industry'),
  skills: z.string().min(1, 'Please enter at least one skill'), // Comma separated for now
  experienceYears: z.number().min(0, 'Must be 0 or greater'),
});

const locationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Enter a valid pincode'),
});

const onboardingSchema = z.object({
  personal: personalDetailsSchema,
  professional: skillsSchema,
  location: locationSchema,
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

// ─── Steps Config ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'personal', title: 'Personal Details', icon: User },
  { id: 'professional', title: 'Professional Info', icon: Briefcase },
  { id: 'location', title: 'Location', icon: MapPin },
];

export default function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We use one big form or separate forms. For simplicity, one big form with nested fields.
  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      personal: { bio: '', dateOfBirth: '' },
      professional: { industry: '', skills: '', experienceYears: 0 },
      location: { city: '', state: '', pincode: '' },
    },
    mode: 'onTouched',
  });

  const nextStep = async () => {
    // Validate current step fields before proceeding
    let fieldsToValidate: string[] = [];
    if (currentStep === 0) fieldsToValidate = ['personal.bio', 'personal.dateOfBirth'];
    if (currentStep === 1)
      fieldsToValidate = [
        'professional.industry',
        'professional.skills',
        'professional.experienceYears',
      ];

    const isValid = await form.trigger(fieldsToValidate as Array<'personal' | 'professional' | 'location' | 'personal.bio' | 'personal.dateOfBirth' | 'professional.industry' | 'professional.skills' | 'professional.experienceYears' | 'location.city' | 'location.state' | 'location.pincode'>);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: OnboardingForm) => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to complete onboarding
      console.log('Submitting onboarding data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // Redirect to dashboard based on role
      void navigate('/dashboard', { replace: true });
    } catch (_error) {

      console.error('Failed to complete onboarding:', _error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="border-b border-border bg-primary/5 p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome to SHIFTLY</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Let's get your profile set up so you can get started.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="px-8 pt-8">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-border" />
            <div
              className="absolute left-0 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-card px-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground shadow-brand'
                        : isCompleted
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          type safety
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Personal Details</h2>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        A short bio about yourself
                      </label>
                      <textarea
                        {...form.register('personal.bio')}
                        placeholder="I am a hardworking professional..."
                        className="min-h-[100px] w-full resize-none rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Date of Birth</label>
                      <input
                        type="date"
                        {...form.register('personal.dateOfBirth')}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Professional Experience
                    </h2>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Primary Industry
                      </label>
                      <select
                        {...form.register('professional.industry')}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select industry...</option>
                        <option value="hospitality">Hospitality</option>
                        <option value="retail">Retail</option>
                        <option value="logistics">Logistics & Warehousing</option>
                        <option value="healthcare">Healthcare</option>
                      </select>
                      {form.formState.errors.professional?.industry && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.professional.industry.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Skills (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Forklift, Inventory, Customer Service"
                        {...form.register('professional.skills')}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      {form.formState.errors.professional?.skills && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.professional.skills.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...form.register('professional.experienceYears', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Where are you located?
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">City</label>
                        <input
                          type="text"
                          {...form.register('location.city')}
                          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        {form.formState.errors.location?.city && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.location.city.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">State</label>
                        <input
                          type="text"
                          {...form.register('location.state')}
                          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        {form.formState.errors.location?.state && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.location.state.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Pincode / Zip</label>
                      <input
                        type="text"
                        {...form.register('location.pincode')}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      {form.formState.errors.location?.pincode && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.location.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"

                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground shadow-brand transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Complete Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

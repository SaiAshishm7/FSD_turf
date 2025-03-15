import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const RESET_COOLDOWN = 60; // 60 seconds cooldown

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [searchParams] = useSearchParams();
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check URL parameters for reset mode
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const type = searchParams.get("type");

    if ((access_token || refresh_token) && type === "recovery") {
      setIsResetMode(true);
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    if (cooldown > 0) {
      toast({
        title: "Please wait",
        description: `You can request another reset link in ${cooldown} seconds.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get the current site URL
      const siteURL = window.location.origin;
      console.log('Current site URL:', siteURL);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteURL}/reset-password?type=recovery`,
      });

      if (error) {
        console.error('Reset password error:', error);
        if (error.message?.toLowerCase().includes('rate limit')) {
          setCooldown(RESET_COOLDOWN);
          toast({
            title: "Too many attempts",
            description: `Please wait ${RESET_COOLDOWN} seconds before requesting another reset link.`,
            variant: "destructive",
          });
          return;
        }
        if (error.message?.includes('valid URL')) {
          console.error('Invalid URL error. Site URL:', siteURL);
          toast({
            title: "Error",
            description: "Please try again in a few minutes. If the problem persists, contact support.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      console.log('Password reset initiated successfully');

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link. Please check your spam folder if you don't see it.",
      });
      setCooldown(RESET_COOLDOWN);
    } catch (error: any) {
      console.error('Reset password error details:', error);
      toast({
        title: "Error",
        description: "Unable to send reset link. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get the tokens from URL
      const access_token = searchParams.get("access_token");
      const refresh_token = searchParams.get("refresh_token");

      if (!access_token && !refresh_token) {
        throw new Error("No reset token found. Please request a new reset link.");
      }

      // Set the session if we have the tokens
      if (access_token && refresh_token) {
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token
        });

        if (sessionError) throw sessionError;
        console.log('Session set successfully:', session);
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Update password error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Your password has been reset. Please sign in with your new password.",
      });
      
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Navigate to login
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again or request a new reset link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto px-4 h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="w-full space-y-6 bg-card p-6 rounded-xl border">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {isResetMode ? "Reset Your Password" : "Forgot Password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isResetMode
              ? "Enter your new password below."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        <form onSubmit={isResetMode ? handleResetPassword : handleRequestReset} className="space-y-4">
          {!isResetMode ? (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {cooldown > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  You can request another reset link in {cooldown} seconds
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </>
          )}

          <Button 
            className="w-full" 
            type="submit" 
            disabled={loading || (!isResetMode && cooldown > 0)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isResetMode ? "Resetting..." : "Sending..."}
              </>
            ) : isResetMode ? (
              "Reset Password"
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => navigate("/auth")}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 
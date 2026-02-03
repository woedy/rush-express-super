import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }
        if (!token) {
            toast({
                title: "Error",
                description: "Missing or invalid reset token.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.confirmPasswordReset(token, password);
            toast({
                title: "Success",
                description: "Your password has been reset successfully.",
            });
            navigate("/login");
        } catch (error: any) {
            // Error handled in handleResponse
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md shadow-medium">
                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !token}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                        {!token && (
                            <p className="text-center text-sm text-destructive">
                                Invalid reset link. Please request a new one.
                            </p>
                        )}
                        <div className="text-center">
                            <Link to="/login" className="text-sm text-primary hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;

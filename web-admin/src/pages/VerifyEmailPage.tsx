import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    const token = searchParams.get("token");

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus("error");
                setMessage("No verification token found.");
                return;
            }

            try {
                const response = await apiClient.verifyEmail(token);
                setStatus("success");
                setMessage(response.message);
            } catch (error: any) {
                setStatus("error");
                setMessage(error.message || "Verification failed.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md shadow-medium">
                <CardHeader className="text-center">
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>
                        {status === "loading" && "Verifying your email address..."}
                        {status === "success" && "Your email has been successfully verified."}
                        {status === "error" && "We couldn't verify your email address."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                    {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                    {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}

                    <p className="text-center text-sm text-muted-foreground">{message}</p>

                    {status !== "loading" && (
                        <Button onClick={() => navigate("/login")} className="w-full">
                            Proceed to Login
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmailPage;

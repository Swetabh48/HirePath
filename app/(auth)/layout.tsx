"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.action";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      if (auth) router.push("/");
      else setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;

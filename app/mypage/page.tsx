"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Briefcase, BarChart3 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import ProtectedRoute from "@/components/protected-route";

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    console.log("MyPage: ページがロードされました", {
      url: window.location.href,
      time: new Date().toISOString(),
      isAuthenticated,
      user: user ? { id: user.id, email: user.email } : null,
    });

    // マイページにアクセスしたことを記録
    if (typeof window !== "undefined") {
      localStorage.setItem("hasVisitedMypage", "true");
    }

    const fetchUserName = async () => {
      if (user?.id) {
        try {
          // worksheet_analyticsテーブルからintroduction_nameを取得
          const { data, error } = await supabase
            .from("worksheet_analytics")
            .select("introduction_name")
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("ユーザー名の取得エラー:", error);
          }

          // introduction_nameが取得できた場合はそれを使用
          if (data && data.introduction_name) {
            setUserName(data.introduction_name);
            return;
          }
        } catch (error) {
          console.error("ユーザー名の取得中にエラーが発生しました:", error);
        }
      }

      // worksheet_analyticsからintroduction_nameが取得できなかった場合は「ユーザーさん」を使用
      setUserName("ユーザー");
    };

    if (isAuthenticated) {
      fetchUserName();
    }
  }, [user, isAuthenticated]);

  const modules = [
    {
      title: "やさしいキャリアデザイン",
      description:
        "内発的動機の発見を通した自律的キャリアを達成するための目標設定",
      icon: <BookOpen className="h-8 w-8 text-gray-800" />,
      href: "/worksheet/1",
      color: "border-atm-gold",
    },
    {
      title: "やさしいメンタリング",
      description: "目標を実現するための週次でのふりかえり",
      icon: <Calendar className="h-8 w-8 text-gray-800" />,
      href: "/new-beginnings",
      color: "border-atm-gold",
    },
    {
      title: "社内タレントマーケットプレイス",
      description:
        "目標達成に必要な経験とスキルを習得できる業務・プロジェクトとのマッチング",
      icon: <Briefcase className="h-8 w-8 text-gray-800" />,
      href: "/marketplace",
      color: "border-atm-gold",
    },
    {
      title: "メンタリングダッシュボード",
      description:
        "メンタリングの対話や成果物からメンバーのモチベーションや成長度合いを把握",
      icon: <BarChart3 className="h-8 w-8 text-gray-800" />,
      href: "https://v0-any-time-mentor-dashboard-ut.vercel.app/dashboard",
      color: "border-atm-gold",
    },
  ];

  // ユーザー名の表示テキストを生成
  const welcomeText = authLoading
    ? "ようこそ"
    : `ようこそ、${userName || "メンバー"}さん`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-atm-beige">
        <header className="bg-white border-b border-atm-gold">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              やさしいメンタリング マイページ
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  signOut();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </Button>
              <Image
                src="/images/anytime-mentor-logo.jpeg"
                alt="Any Time Mentor"
                width={90}
                height={30}
                className="h-auto"
                style={{ maxWidth: "90px" }}
                priority
              />
            </div>
          </div>
        </header>

        <main className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {welcomeText}
            </h2>
            <p className="text-gray-600">
              あなたの自律的なキャリア形成と成長をサポートするツールにアクセスできます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module, index) => (
              <Card
                key={index}
                className={`h-full hover:shadow-md transition-shadow ${module.color}`}
              >
                <CardHeader className="border-b border-atm-gold/30 bg-atm-gold/10">
                  <div className="flex items-center gap-4">
                    {module.icon}
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl text-gray-800">
                        {module.title}
                      </CardTitle>
                      {module.title === "メンタリングダッシュボード" && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">
                          管理者専用
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 bg-white">
                  <CardDescription className="text-gray-700 text-base">
                    {module.description}
                  </CardDescription>
                  <div className="mt-4">
                    <Link href={module.href}>
                      <Button className="bg-atm-gold text-gray-800 hover:bg-atm-gold/90">
                        アクセスする
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>

        <footer className="bg-white border-t border-atm-gold py-4 mt-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            © 2025 ANY TIME MENTOR やさしいメンタリング
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

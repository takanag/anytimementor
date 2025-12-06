"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  email: string;
  user_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_super_admin: boolean;
  organization_code: string | null;
  raw_user_meta_data: any;
  approval_status: string;
};

type OrganizationCode = {
  id: string;
  code: string;
  description: string;
  is_active: boolean;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizationCodes, setOrganizationCodes] = useState<
    OrganizationCode[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "authenticated",
    is_super_admin: false,
    organization_code: "none",
  });

  // 組織コードを取得する関数
  const fetchOrganizationCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("organization_codes")
        .select("*")
        .eq("is_active", true)
        .order("code", { ascending: true });

      if (error) {
        console.error("組織コード取得エラー:", error);
        return;
      }

      setOrganizationCodes(data || []);
    } catch (err) {
      console.error("組織コード取得エラー:", err);
    }
  };

  // ユーザーデータを取得する関数
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // user_profilesテーブルからすべてのユーザーを取得
      console.log("user_profilesテーブルからユーザーデータを取得しています...");

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profileError) {
        console.error("プロファイル取得エラーの詳細:", {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        });
        throw new Error(`プロファイル取得エラー: ${profileError.message}`);
      }

      console.log(`取得したユーザー数: ${profileData?.length || 0}`);

      if (profileData) {
        // user_idのリストを作成
        const userIds = profileData.map((user: any) => user.id).filter(Boolean);

        // worksheet_analyticsからuser_name（introduction_name）を取得
        // APIルート経由で取得（RLSポリシーをバイパス）
        let userNameMap: { [key: string]: string | null } = {};
        if (userIds.length > 0) {
          // user_idを文字列に正規化（型の不一致を防ぐ）
          const normalizedUserIds = userIds.map((id) => String(id).trim());
          console.log(
            `[DEBUG] user_idリスト: ${normalizedUserIds.length}件`,
            normalizedUserIds
          );

          try {
            // APIルート経由でユーザー名を取得
            const response = await fetch("/api/users/user-names", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ user_ids: normalizedUserIds }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error("[DEBUG] ユーザー名取得APIエラー:", errorData);
            } else {
              const data = await response.json();
              userNameMap = data.user_names || {};
              console.log(
                `[DEBUG] API経由で取得したユーザー名マップ: ${
                  Object.keys(userNameMap).length
                }件`,
                userNameMap
              );
            }
          } catch (error: any) {
            console.error("[DEBUG] ユーザー名取得API呼び出しエラー:", error);
          }
        }

        // ユーザーデータを整形
        const formattedUsers = profileData.map((user: any, index: number) => {
          // user.idを正規化してマップから取得
          const normalizedUserId = String(user.id).trim();
          const userName = userNameMap[normalizedUserId] || null;

          // デバッグ用ログ（最初の10件のみ）
          if (index < 10) {
            const mapHasKey = normalizedUserId in userNameMap;
            console.log(
              `[DEBUG] ユーザー整形 [${index}]: id="${user.id}" (正規化: "${normalizedUserId}") => マップに存在: ${mapHasKey}, user_name="${userName}"`
            );
          }

          return {
            id: user.id,
            email: user.email,
            user_name: userName,
            role: user.role || "authenticated",
            created_at: new Date(user.created_at).toLocaleString("ja-JP"),
            last_sign_in_at: user.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleString("ja-JP")
              : null,
            is_super_admin: user.is_super_admin || false,
            organization_code: user.organization_code || null,
            raw_user_meta_data: user.user_metadata || {},
            approval_status: user.approval_status || "pending",
          };
        });

        // ユーザー名が取得できたユーザー数を確認
        const usersWithName = formattedUsers.filter((u) => u.user_name).length;
        console.log(
          `[DEBUG] ユーザー名が取得できたユーザー数: ${usersWithName}/${formattedUsers.length}`
        );

        console.log("フォーマット済みユーザー数:", formattedUsers.length);
        setUsers(formattedUsers);
      }
    } catch (err: any) {
      console.error("ユーザー取得エラー:", err);
      setError(err.message || "ユーザーデータの取得に失敗しました");
      toast({
        title: "エラー",
        description: "ユーザーデータの取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    fetchUsers();
    fetchOrganizationCodes();
  }, []);

  // 組織コード名を取得する関数
  const getOrganizationCodeName = (code: string | null) => {
    if (!code) return "-";
    const orgCode = organizationCodes.find((oc) => oc.code === code);
    return orgCode ? `${orgCode.code} (${orgCode.description})` : code;
  };

  // 新規ユーザーを作成する関数
  const handleCreateUser = async () => {
    try {
      setLoading(true);

      // 入力バリデーション
      if (!newUser.email || !newUser.password) {
        toast({
          title: "入力エラー",
          description: "メールアドレスとパスワードは必須です",
          variant: "destructive",
        });
        return;
      }

      const organizationCodeValue =
        newUser.organization_code === "none" ? null : newUser.organization_code;

      // 通常のサインアップAPIを使用してユーザーを作成
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            role: newUser.role,
            is_super_admin: newUser.is_super_admin,
            organization_code: organizationCodeValue,
          },
        },
      });

      if (error) {
        throw error;
      }

      // ユーザーが作成されたら、user_profilesテーブルにも直接データを挿入
      // （トリガーが機能しない場合に備えて）
      if (data && data.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            id: data.user.id,
            email: data.user.email,
            role: newUser.role,
            created_at: data.user.created_at,
            last_sign_in_at: data.user.last_sign_in_at,
            is_super_admin: newUser.is_super_admin,
            organization_code: organizationCodeValue,
            user_metadata: data.user.user_metadata || {},
          });

        if (profileError) {
          console.error("プロファイル作成エラー:", profileError);
          // プロファイル作成エラーは致命的ではないので、続行
        }
      }

      toast({
        title: "ユーザー作成完了",
        description: "新しいユーザーが作成されました",
      });

      // ダイアログを閉じて入力をリセット
      setIsCreateDialogOpen(false);
      setNewUser({
        email: "",
        password: "",
        role: "authenticated",
        is_super_admin: false,
        organization_code: "none",
      });

      // ユーザーリストを更新
      fetchUsers();
    } catch (err: any) {
      console.error("ユーザー作成エラー:", err);
      toast({
        title: "エラー",
        description: err.message || "ユーザーの作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ユーザーを更新する関数
  const handleUpdateUser = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // APIを使用してユーザー情報を更新
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: currentUser.role,
          is_super_admin: currentUser.is_super_admin,
          organization_code: currentUser.organization_code,
          user_name: currentUser.user_name,
          email: currentUser.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.details
          ? `${result.error}: ${result.details}`
          : result.error || "ユーザーの更新に失敗しました";
        throw new Error(errorMessage);
      }

      // 警告がある場合は警告として表示
      if (result.warning) {
        toast({
          title: "更新完了（警告あり）",
          description: result.warning,
          variant: "default",
        });
      } else {
        toast({
          title: "ユーザー更新完了",
          description: "ユーザー情報が更新されました",
        });
      }

      // ダイアログを閉じる
      setIsEditDialogOpen(false);
      setCurrentUser(null);

      // ユーザーリストを更新
      fetchUsers();
    } catch (err: any) {
      console.error("ユーザー更新エラー:", err);
      toast({
        title: "エラー",
        description: err.message || "ユーザーの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ユーザーを削除する関数
  const handleDeleteUser = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // APIを使用してユーザーを削除
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.details
          ? `${error.error}: ${error.details}`
          : error.error || "ユーザーの削除に失敗しました";
        throw new Error(errorMessage);
      }

      toast({
        title: "ユーザー削除完了",
        description: "ユーザーが削除されました",
      });

      // ダイアログを閉じる
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);

      // ユーザーリストを更新
      fetchUsers();
    } catch (err: any) {
      console.error("ユーザー削除エラー:", err);
      toast({
        title: "エラー",
        description: err.message || "ユーザーの削除に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ユーザーの承認状態を更新する関数
  const handleUpdateApprovalStatus = async (
    userId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("user_profiles")
        .update({ approval_status: status })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // ユーザーリストを更新
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, approval_status: status } : user
        )
      );

      toast({
        title: "承認状態を更新しました",
        description: `ユーザーの承認状態を${
          status === "approved" ? "承認" : "却下"
        }に更新しました`,
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">ユーザーデータを読み込み中...</span>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchUsers}>再試行</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <a
            href="/admin"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            ← 管理者メニューに戻る
          </a>
          <h2 className="text-2xl font-bold">ユーザー管理</h2>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>新規ユーザー作成</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規ユーザー作成</DialogTitle>
              <DialogDescription>
                新しいユーザーアカウントを作成します。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  パスワード
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  ロール
                </Label>
                <Input
                  id="role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="organization_code" className="text-right">
                  組織コード
                </Label>
                <Select
                  value={newUser.organization_code}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, organization_code: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="組織コードを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {organizationCodes.map((orgCode) => (
                      <SelectItem key={orgCode.id} value={orgCode.code}>
                        {orgCode.code} - {orgCode.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_super_admin" className="text-right">
                  管理者権限
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox
                    id="is_super_admin"
                    checked={newUser.is_super_admin}
                    onCheckedChange={(checked) =>
                      setNewUser({
                        ...newUser,
                        is_super_admin: checked === true,
                      })
                    }
                  />
                  <Label htmlFor="is_super_admin" className="ml-2">
                    管理者として設定する
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button onClick={handleCreateUser} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                作成
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ユーザー名</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>管理者</TableHead>
              <TableHead>組織コード</TableHead>
              <TableHead>作成日時</TableHead>
              <TableHead>最終ログイン</TableHead>
              <TableHead>承認状態</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell>{user.user_name || "不明"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.is_super_admin ? "はい" : "いいえ"}</TableCell>
                <TableCell>
                  {getOrganizationCodeName(user.organization_code)}
                </TableCell>
                <TableCell>{user.created_at}</TableCell>
                <TableCell>{user.last_sign_in_at || "未ログイン"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.approval_status === "approved"
                        ? "success"
                        : user.approval_status === "rejected"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {user.approval_status === "approved"
                      ? "承認済み"
                      : user.approval_status === "rejected"
                      ? "却下"
                      : "承認待ち"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">メニューを開く</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>アクション</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {user.approval_status === "pending" && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateApprovalStatus(user.id, "approved")
                            }
                          >
                            承認する
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateApprovalStatus(user.id, "rejected")
                            }
                          >
                            却下する
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
            <DialogDescription>ユーザー情報を編集します。</DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID</Label>
                <div className="col-span-3 font-mono text-xs">
                  {currentUser.id}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user_name" className="text-right">
                  ユーザー名
                </Label>
                <Input
                  id="edit-user_name"
                  value={currentUser.user_name || ""}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      user_name: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="ユーザー名を入力"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  メールアドレス
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, email: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="メールアドレスを入力"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  ロール
                </Label>
                <Input
                  id="edit-role"
                  value={currentUser.role}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, role: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-organization_code" className="text-right">
                  組織コード
                </Label>
                <Select
                  value={currentUser.organization_code || "none"}
                  onValueChange={(value) =>
                    setCurrentUser({
                      ...currentUser,
                      organization_code: value === "none" ? null : value,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="組織コードを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {organizationCodes.map((orgCode) => (
                      <SelectItem key={orgCode.id} value={orgCode.code}>
                        {orgCode.code} - {orgCode.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is_super_admin" className="text-right">
                  管理者権限
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox
                    id="edit-is_super_admin"
                    checked={currentUser.is_super_admin}
                    onCheckedChange={(checked) =>
                      setCurrentUser({
                        ...currentUser,
                        is_super_admin: checked === true,
                      })
                    }
                  />
                  <Label htmlFor="edit-is_super_admin" className="ml-2">
                    管理者として設定する
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleUpdateUser} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー削除</DialogTitle>
            <DialogDescription>
              このユーザーを削除してもよろしいですか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="py-4">
              <p>
                <strong>ID:</strong>{" "}
                <span className="font-mono text-xs">{currentUser.id}</span>
              </p>
              <p>
                <strong>メールアドレス:</strong> {currentUser.email}
              </p>
              <p>
                <strong>ロール:</strong> {currentUser.role}
              </p>
              <p>
                <strong>組織コード:</strong>{" "}
                {getOrganizationCodeName(currentUser.organization_code)}
              </p>
              <p>
                <strong>作成日時:</strong> {currentUser.created_at}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

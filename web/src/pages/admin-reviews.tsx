import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function AdminReviewsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const { toast } = useToast();

  function loadApps() {
    api.adminListApps().then(setApps);
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function handleApprove(a: any) {
    try {
      await api.reviewListing(a.id, true);
      toast({ title: `「${a.name}」已通过上架` });
      loadApps();
    } catch (e: any) {
      toast({ variant: "destructive", title: "操作失败", description: e.message });
    }
  }

  async function handleReject(a: any) {
    const reason = prompt("拒绝原因：");
    if (!reason) return;
    try {
      await api.reviewListing(a.id, false, reason);
      toast({ title: `「${a.name}」已拒绝` });
      loadApps();
    } catch (e: any) {
      toast({ variant: "destructive", title: "操作失败", description: e.message });
    }
  }

  async function handleToggle(a: any) {
    const newListing = a.listing === "listed" ? "unlisted" : "listed";
    try {
      await api.setAppListing(a.id, newListing);
      loadApps();
    } catch (e: any) {
      toast({ variant: "destructive", title: "操作失败", description: e.message });
    }
  }

  const listingBadge = (listing: string) => {
    if (listing === "listed") return <Badge variant="default">已上架</Badge>;
    if (listing === "pending")
      return (
        <Badge variant="outline" className="text-orange-500 border-orange-400">
          待审核
        </Badge>
      );
    if (listing === "rejected") return <Badge variant="destructive">已拒绝</Badge>;
    return <Badge variant="secondary">未上架</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">审核中心</h1>
          <p className="text-sm text-muted-foreground mt-0.5">审核应用上架请求。</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table className="table-fixed">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>应用名称</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>开发者</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{a.slug}</TableCell>
                <TableCell className="text-sm">{a.owner_username}</TableCell>
                <TableCell>{listingBadge(a.listing)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {a.listing === "pending" ? (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          className="gap-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          onClick={() => handleApprove(a)}
                        >
                          <Check className="h-3 w-3" /> 通过
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => handleReject(a)}
                        >
                          <X className="h-3 w-3" /> 拒绝
                        </Button>
                      </>
                    ) : (
                      <Button size="xs" variant="outline" onClick={() => handleToggle(a)}>
                        {a.listing === "listed" ? "下架" : "上架"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  暂无应用
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

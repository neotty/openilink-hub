import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BotTracesTab } from "./bot-traces-tab";

export function TracesPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-full px-4 font-bold text-xs" asChild>
          <Link to={`/dashboard/accounts/${id}`}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            返回账号
          </Link>
        </Button>
        <h1 className="text-xl font-bold">消息追踪</h1>
      </div>
      <BotTracesTab botId={id} />
    </div>
  );
}

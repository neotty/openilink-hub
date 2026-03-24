import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import { Blocks, Plus, ExternalLink, CheckCircle, XCircle, Settings } from "lucide-react";

export function BotAppsTab({ botId }: { botId: string }) {
  const [installations, setInstallations] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [showInstall, setShowInstall] = useState(false);
  const [installing, setInstalling] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      setInstallations((await api.listBotApps(botId)) || []);
    } catch {}
  }

  async function loadApps() {
    try {
      setApps((await api.listApps()) || []);
    } catch {}
  }

  useEffect(() => {
    load();
  }, [botId]);

  async function handleInstall(appId: string, slug: string) {
    setInstalling(appId);
    setError("");
    try {
      await api.installApp(appId, { bot_id: botId, handle: slug });
      setShowInstall(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
    setInstalling("");
  }

  async function handleUninstall(appId: string, instId: string) {
    if (!confirm("确定卸载此 App？")) return;
    try {
      await api.deleteInstallation(appId, instId);
      load();
    } catch {}
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">已安装的 App</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowInstall(!showInstall);
            if (!showInstall) loadApps();
          }}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> 安装 App
        </Button>
      </div>

      {installations.length === 0 && !showInstall && (
        <div className="text-center py-12 space-y-3">
          <Blocks className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">暂无安装的 App</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowInstall(true);
              loadApps();
            }}
          >
            浏览 App 市场
          </Button>
        </div>
      )}

      {/* Installed apps */}
      <div className="space-y-2">
        {installations.map((inst) => (
          <Card key={inst.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                {inst.app_icon && <span className="text-lg">{inst.app_icon}</span>}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{inst.app_name}</span>
                    {inst.handle && (
                      <Badge variant="outline" className="text-xs font-mono">
                        @{inst.handle}
                      </Badge>
                    )}
                    {inst.enabled ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-0.5" /> 启用
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <XCircle className="w-3 h-3 mr-0.5" /> 停用
                      </Badge>
                    )}
                    {inst.url_verified && (
                      <Badge variant="outline" className="text-xs text-primary">
                        URL 已验证
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {inst.request_url || "未配置 Request URL"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/dashboard/apps/${inst.app_id}`)}
                  title="App 设置"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUninstall(inst.app_id, inst.id)}
                  className="text-destructive"
                >
                  卸载
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Install picker */}
      {showInstall && (
        <Card>
          <CardContent className="space-y-3 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">选择 App</p>
              <Button variant="ghost" size="sm" onClick={() => setShowInstall(false)}>
                关闭
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            {apps.length === 0 && (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-muted-foreground">没有可用的 App</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/apps")}
                >
                  <ExternalLink className="w-3 h-3 mr-1" /> 去创建 App
                </Button>
              </div>
            )}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {apps.map((app) => {
                const installCount = installations.filter((i) => i.app_id === app.id).length;
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-background"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {app.icon && <span>{app.icon}</span>}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium">{app.name}</span>
                          <span className="text-xs text-muted-foreground">{app.slug}</span>
                          {installCount > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              已安装 {installCount} 次
                            </Badge>
                          )}
                        </div>
                        {app.description && (
                          <p className="text-xs text-muted-foreground truncate">{app.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={installing === app.id}
                      onClick={() => handleInstall(app.id, app.slug)}
                      className="shrink-0"
                    >
                      {installing === app.id ? "..." : "安装"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

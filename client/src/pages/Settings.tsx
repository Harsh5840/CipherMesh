import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  const { data: userSettings } = useQuery({
    queryKey: ['/api/auth/settings'],
    enabled: !!user,
  });

  const [settings, setSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    defaultExpiration: userSettings?.settings?.defaultExpiration || '24h',
    defaultMaxDownloads: userSettings?.settings?.defaultMaxDownloads || 1,
    passwordProtectionDefault: userSettings?.settings?.passwordProtectionDefault || false,
    twoFactorEnabled: userSettings?.settings?.twoFactorEnabled || false,
    loginNotifications: userSettings?.settings?.loginNotifications || true,
    activityLogs: userSettings?.settings?.activityLogs || false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      await apiRequest('PUT', '/api/auth/user', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('PUT', '/api/auth/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/settings'] });
      toast({
        title: "Settings updated",
        description: "Your settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      firstName: settings.firstName,
      lastName: settings.lastName,
      email: settings.email,
    });
  };

  const handleUpdateSettings = () => {
    updateSettingsMutation.mutate({
      defaultExpiration: settings.defaultExpiration,
      defaultMaxDownloads: settings.defaultMaxDownloads,
      passwordProtectionDefault: settings.passwordProtectionDefault,
      twoFactorEnabled: settings.twoFactorEnabled,
      loginNotifications: settings.loginNotifications,
      activityLogs: settings.activityLogs,
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'preferences', label: 'Preferences', icon: 'fas fa-cog' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <i className={`${tab.icon} mr-3`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                    <img 
                      src={user?.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400`} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </h4>
                    <p className="text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => setSettings(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => setSettings(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                  <div>
                    <h4 className="font-medium">Login Notifications</h4>
                    <p className="text-sm text-slate-400">Get notified when someone signs in to your account</p>
                  </div>
                  <Switch
                    checked={settings.loginNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, loginNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                  <div>
                    <h4 className="font-medium">Account Activity Logs</h4>
                    <p className="text-sm text-slate-400">Keep detailed logs of account activity</p>
                  </div>
                  <Switch
                    checked={settings.activityLogs}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, activityLogs: checked }))}
                  />
                </div>
                <Button 
                  onClick={handleUpdateSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle>Default Sharing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultExpiration">Default Expiration</Label>
                  <Select value={settings.defaultExpiration} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultExpiration: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="6h">6 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultMaxDownloads">Default Download Limit</Label>
                  <Select value={settings.defaultMaxDownloads.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultMaxDownloads: parseInt(value) }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 download</SelectItem>
                      <SelectItem value="5">5 downloads</SelectItem>
                      <SelectItem value="10">10 downloads</SelectItem>
                      <SelectItem value="100">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                  <div>
                    <h4 className="font-medium">Password Protection by Default</h4>
                    <p className="text-sm text-slate-400">Require password for all shared files</p>
                  </div>
                  <Switch
                    checked={settings.passwordProtectionDefault}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, passwordProtectionDefault: checked }))}
                  />
                </div>
                <Button 
                  onClick={handleUpdateSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Key, Bell, 
  Trash2, Save, Palette, Globe, Database,
  Cpu, Lock, Zap, History, Plus, Upload, Camera
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { GlassInput, GlassToggle } from '../components/ui/GlassInput';
import useAuthStore from '../stores/authStore';

const SettingsPage = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        toast.success('Profile image updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (activeTab === 'api_keys') {
      fetchApiKeys();
    }
  }, [activeTab]);

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const res = await axios.get('/api/api-keys');
      setApiKeys(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const generateKey = async () => {
    const name = prompt('Enter a name for this API key:');
    if (!name) return;

    try {
      const res = await axios.post(`/api/api-keys?name=${encodeURIComponent(name)}`);
      setApiKeys([...apiKeys, { ...res.data, prefix: res.data.key.substring(0, 8), created_at: new Date() }]);
      alert(`API Key Generated: ${res.data.key}\n\nPlease store it safely. It will not be shown again.`);
      fetchApiKeys();
    } catch (err) {
      toast.error('Failed to generate key');
    }
  };

  const deleteKey = async (id) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await axios.delete(`/api/api-keys/${id}`);
      setApiKeys(apiKeys.filter(k => k.id !== id));
      toast.success('Key revoked');
    } catch (err) {
      toast.error('Failed to revoke key');
    }
  };

  const tabs = useMemo(() => [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api_keys', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ], []);

  const onSave = () => {
    toast.success('Settings saved');
  };

  return (
    <div 
      className="space-y-8 mx-auto pb-20"
      style={{ maxWidth: '1400px', paddingLeft: '24px', paddingRight: '24px', paddingTop: '120px' }}
    >
      <div className="flex flex-col md:flex-row justify-between items-end" style={{ gap: '24px' }}>
        <div>
          <h1 className="font-extrabold text-white tracking-tight" style={{ fontSize: '40px', marginBottom: '12px' }}>Settings</h1>
          <p className="text-[#86868b] font-medium" style={{ fontSize: '17px' }}>Manage your profile, security, and notification settings.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row" style={{ gap: '32px', marginTop: '16px' }}>
        {/* Navigation Sidebar */}
        <div className="w-full xl:w-72 flex flex-col" style={{ gap: '6px' }}>
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center justify-between transition-all duration-200 group relative cursor-pointer ${
                 activeTab === tab.id 
                  ? 'bg-[#1c1c1e] text-white border border-white/10' 
                  : 'text-[#86868b] hover:text-white hover:bg-white/5'
               }`}
               style={{ padding: '16px 20px', borderRadius: '16px' }}
             >
               <div className="flex items-center" style={{ gap: '14px' }}>
                  <tab.icon size={20} className={activeTab === tab.id ? 'text-[#007aff]' : 'text-[#52525b] group-hover:text-[#86868b]'} />
                  <span style={{ fontSize: '15px' }} className="font-bold">{tab.label}</span>
               </div>
               {activeTab === tab.id && (
                 <div className="rounded-full bg-[#007aff]" style={{ width: '6px', height: '16px' }} />
               )}
             </button>
           ))}
        </div>

        {/* Main Content Area */}
        <div 
          className="flex-1 overflow-hidden"
          style={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', minHeight: '600px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ padding: '40px' }}
            >
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                   <div className="flex justify-between items-start">
                       <div>
                          <h3 className="font-extrabold text-white" style={{ fontSize: '24px', marginBottom: '8px' }}>Profile Details</h3>
                          <p className="font-medium text-[#86868b]" style={{ fontSize: '16px' }}>Update your account information and how you appear to others.</p>
                       </div>
                      <div className="flex items-center justify-center border border-white/10" style={{ padding: '12px', borderRadius: '16px', backgroundColor: '#2c2c2e' }}>
                         <User size={24} className="text-[#007aff]" />
                      </div>
                   </div>

                   <div className="flex items-center border border-white/10" style={{ gap: '24px', padding: '24px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <div 
                        className="flex items-center justify-center font-extrabold border border-white/10 overflow-hidden" 
                        style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: '#2c2c2e', fontSize: '28px' }}
                      >
                         {profileImage ? (
                           <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         ) : (
                           <span className="text-[#007aff]">{user?.username?.[0].toUpperCase()}</span>
                         )}
                      </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <label className="text-[#86868b] font-bold tracking-wider uppercase" style={{ fontSize: '12px' }}>Profile Image</label>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center font-bold text-white cursor-pointer transition-all hover:opacity-90 active:scale-95"
                            style={{ 
                              gap: '10px', 
                              padding: '12px 24px', 
                              fontSize: '14px', 
                              borderRadius: '14px', 
                              background: 'linear-gradient(135deg, #007aff, #5856d6)', 
                              boxShadow: '0 4px 20px rgba(0, 122, 255, 0.4)',
                              border: 'none',
                            }}
                          >
                            <Camera size={18} />
                            Change Image
                          </button>
                       </div>
                   </div>

                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px' }}>
                       <GlassInput label="Username" defaultValue={user?.username} />
                       <GlassInput label="Email Address" defaultValue={user?.email} />
                    </div>

                   <div className="flex justify-end" style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                       <GlassButton icon={Save} onClick={onSave} style={{ padding: '14px 32px', fontSize: '14px' }}>Save Changes</GlassButton>
                   </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                           <h3 className="text-xl font-bold text-[#fafafa] mb-1">Security</h3>
                           <p className="text-[14px] font-medium text-[#71717a]">Manage your password and account protection.</p>
                        </div>
                        <div className="p-2 bg-[#18181b] rounded-lg border border-[#27272a]">
                           <Lock size={20} className="#ef4444" />
                        </div>
                    </div>

                    <div className="space-y-6 max-w-md">
                       <GlassInput label="Current Password" type="password" placeholder="••••••••" />
                       <div className="h-px bg-[#27272a] w-full" />
                       <GlassInput label="New Password" type="password" />
                       <GlassInput label="Confirm New Password" type="password" />
                    </div>

                   <div className="pt-8 border-t border-[#27272a]">
                      <div className="p-6 rounded-lg bg-[#ef444405] border border-[#ef444415]">
                        <div className="flex items-center gap-3 text-[#ef4444] mb-3">
                            <Trash2 size={16} />
                            <h4 className="text-[12px] font-bold uppercase tracking-wider">Danger Zone</h4>
                        </div>
                         <p className="text-[13px] font-medium text-[#71717a] mb-6 leading-relaxed">
                            Deleting your account is permanent. All workflows, execution logs, and data will be wiped immediately.
                         </p>
                         <GlassButton variant="danger" className="!py-2 !px-6 !text-[12px]">Delete My Account</GlassButton>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'api_keys' && (
                <div className="space-y-8">
                   <div className="flex justify-between items-end pb-4 border-b border-[#27272a]">
                      <div>
                       <h3 className="text-xl font-bold text-[#fafafa] mb-1">API Keys</h3>
                       <p className="text-[14px] font-medium text-[#71717a]">Use these keys to access our API from your own scripts.</p>
                    </div>
                       <GlassButton icon={Plus} className="!py-2 !px-5 !text-[12px]" onClick={generateKey}>Create Key</GlassButton>
                   </div>

                   <div className="space-y-3">
                      {isLoadingKeys ? (
                        <div className="text-center py-20 text-[#52525b] font-semibold text-[13px]">Loading keys...</div>
                      ) : apiKeys.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-24 text-[#27272a] border border-dashed border-[#27272a] rounded-lg">
                            <Key size={32} className="mb-3 opacity-20" />
                            <span className="text-[12px] font-bold text-[#52525b] uppercase tracking-wider">No active keys</span>
                         </div>
                      ) : apiKeys.map(k => (
                        <div key={k.id} className="p-4 rounded-lg border border-[#27272a] bg-[#09090b] flex items-center justify-between hover:border-[#3b82f650] transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-lg bg-[#18181b] text-[#71717a] border border-[#27272a] group-hover:text-[#3b82f6] transition-colors">
                                 <Database size={18} />
                              </div>
                               <div>
                                  <div className="text-[14px] font-bold text-[#fafafa]">{k.name}</div>
                                  <div className="text-[11px] font-mono text-[#52525b] mt-0.5">Prefix: {k.prefix} • {new Date(k.created_at).toLocaleDateString()}</div>
                               </div>
                           </div>
                           <button onClick={() => deleteKey(k.id)} className="text-[#52525b] hover:text-[#ef4444] p-2 hover:bg-[#ef444410] rounded-lg transition-colors">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                    <div>
                       <h3 className="text-xl font-bold text-[#fafafa] mb-1">Notifications</h3>
                       <p className="text-[14px] font-medium text-[#71717a]">Manage how you receive alerts and updates.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                       <div className="p-6 rounded-lg bg-[#09090b] border border-[#27272a] space-y-6">
                          <GlassToggle label="Workflow failure alerts" checked={true} />
                          <div className="h-px bg-[#27272a]" />
                          <GlassToggle label="Weekly summary emails" checked={false} />
                          <div className="h-px bg-[#27272a]" />
                          <GlassToggle label="New product features" checked={true} />
                          <div className="h-px bg-[#27272a]" />
                          <GlassToggle label="System maintenance notifications" checked={true} />
                       </div>
                    </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default memo(SettingsPage);

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
                          <span className="text-[#86868b] font-bold tracking-wider uppercase" style={{ fontSize: '12px' }}>Profile Image</span>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/png,image/jpeg,image/gif,image/webp" 
                            style={{ display: 'none' }} 
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              fileInputRef.current.click();
                            }}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="flex justify-between items-start">
                        <div>
                           <h3 className="font-extrabold text-white" style={{ fontSize: '24px', marginBottom: '8px' }}>Security</h3>
                           <p className="font-medium text-[#86868b]" style={{ fontSize: '16px' }}>Manage your password and account protection.</p>
                        </div>
                        <div className="flex items-center justify-center border border-white/10" style={{ padding: '12px', borderRadius: '16px', backgroundColor: '#2c2c2e' }}>
                           <Lock size={24} className="text-[#ff3b30]" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '520px' }}>
                       <GlassInput label="Current Password" type="password" placeholder="••••••••" />
                       <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', width: '100%' }} />
                       <GlassInput label="New Password" type="password" />
                       <GlassInput label="Confirm New Password" type="password" />
                    </div>

                    <div className="flex justify-end" style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                       <GlassButton icon={Save} onClick={onSave} style={{ padding: '14px 32px', fontSize: '14px' }}>Update Password</GlassButton>
                    </div>

                   <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: 'rgba(255, 59, 48, 0.04)', border: '1px solid rgba(255, 59, 48, 0.12)' }}>
                        <div className="flex items-center text-[#ff3b30]" style={{ gap: '12px', marginBottom: '16px' }}>
                            <Trash2 size={20} />
                            <h4 className="font-extrabold uppercase tracking-wider" style={{ fontSize: '13px' }}>Danger Zone</h4>
                        </div>
                         <p className="font-medium text-[#86868b]" style={{ fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
                            Deleting your account is permanent. All workflows, execution logs, and data will be wiped immediately.
                         </p>
                         <button
                           className="font-bold text-white cursor-pointer transition-all hover:opacity-90 active:scale-95"
                           style={{ 
                             padding: '12px 24px', fontSize: '14px', borderRadius: '14px', 
                             background: 'linear-gradient(135deg, #ff3b30, #ff2d55)', 
                             boxShadow: '0 4px 20px rgba(255, 59, 48, 0.3)', border: 'none' 
                           }}
                         >Delete My Account</button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'api_keys' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                   <div className="flex justify-between items-end" style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                       <h3 className="font-extrabold text-white" style={{ fontSize: '24px', marginBottom: '8px' }}>API Keys</h3>
                       <p className="font-medium text-[#86868b]" style={{ fontSize: '16px' }}>Use these keys to access our API from your own scripts.</p>
                    </div>
                       <button
                         onClick={generateKey}
                         className="flex items-center font-bold text-white cursor-pointer transition-all hover:opacity-90 active:scale-95"
                         style={{ 
                           gap: '10px', padding: '12px 24px', fontSize: '14px', borderRadius: '14px', 
                           background: 'linear-gradient(135deg, #007aff, #5856d6)', 
                           boxShadow: '0 4px 20px rgba(0, 122, 255, 0.4)', border: 'none' 
                         }}
                       >
                         <Plus size={18} />
                         Create Key
                       </button>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {isLoadingKeys ? (
                        <div className="text-center text-[#86868b] font-bold" style={{ padding: '80px 0', fontSize: '14px' }}>Loading keys...</div>
                      ) : apiKeys.length === 0 ? (
                         <div 
                           className="flex flex-col items-center justify-center border border-dashed border-white/10"
                           style={{ padding: '80px 0', borderRadius: '20px' }}
                         >
                            <Key size={40} className="text-[#86868b] opacity-30" style={{ marginBottom: '16px' }} />
                            <span className="font-bold text-[#52525b] uppercase tracking-wider" style={{ fontSize: '13px' }}>No active keys</span>
                         </div>
                      ) : apiKeys.map(k => (
                        <div 
                          key={k.id} 
                          className="flex items-center justify-between hover:bg-white/5 transition-colors group border border-white/10"
                          style={{ padding: '20px 24px', borderRadius: '16px' }}
                        >
                           <div className="flex items-center" style={{ gap: '20px' }}>
                              <div 
                                className="flex items-center justify-center text-[#86868b] border border-white/10 group-hover:text-[#007aff] transition-colors"
                                style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#2c2c2e' }}
                              >
                                 <Database size={22} />
                              </div>
                               <div>
                                  <div className="font-bold text-white" style={{ fontSize: '16px', marginBottom: '4px' }}>{k.name}</div>
                                  <div className="font-mono text-[#52525b]" style={{ fontSize: '12px' }}>Prefix: {k.prefix} • {new Date(k.created_at).toLocaleDateString()}</div>
                               </div>
                           </div>
                           <button 
                             onClick={() => deleteKey(k.id)} 
                             className="text-[#52525b] hover:text-[#ff3b30] hover:bg-[#ff3b3010] transition-colors"
                             style={{ padding: '10px', borderRadius: '12px' }}
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                       <h3 className="font-extrabold text-white" style={{ fontSize: '24px', marginBottom: '8px' }}>Notifications</h3>
                       <p className="font-medium text-[#86868b]" style={{ fontSize: '16px' }}>Manage how you receive alerts and updates.</p>
                    </div>

                    <div>
                       <div 
                         className="border border-white/10"
                         style={{ borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px' }}
                       >
                          <div style={{ padding: '20px 24px' }}>
                            <GlassToggle label="Workflow failure alerts" checked={true} />
                          </div>
                          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: '24px', marginRight: '24px' }} />
                          <div style={{ padding: '20px 24px' }}>
                            <GlassToggle label="Weekly summary emails" checked={false} />
                          </div>
                          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: '24px', marginRight: '24px' }} />
                          <div style={{ padding: '20px 24px' }}>
                            <GlassToggle label="New product features" checked={true} />
                          </div>
                          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: '24px', marginRight: '24px' }} />
                          <div style={{ padding: '20px 24px' }}>
                            <GlassToggle label="System maintenance notifications" checked={true} />
                          </div>
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

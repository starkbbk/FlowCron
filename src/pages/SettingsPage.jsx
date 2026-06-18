import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Key, Bell, 
  Trash2, Save, Database,
  Lock, Camera, Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { GlassInput, GlassToggle } from '../components/ui/GlassInput';
import useAuthStore from '../stores/authStore';
import api from '../services/api';
import { useClerk } from '@clerk/clerk-react';

const SettingsPage = () => {
  const clerk = useClerk();
  const { user, logout, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profile_image || null);
  const [username, setUsername] = useState(user?.username || '');
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64
        toast.error('Image is too large. Please select an image under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
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
      const res = await api.get('/api-keys');
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
      const res = await api.post(`/api-keys?name=${encodeURIComponent(name)}`);
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
      await api.delete(`/api-keys/${id}`);
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

  const onSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.patch('/auth/profile', {
        username,
        profile_image: profileImage
      });
      setUser(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="flex flex-col gap-6 lg:gap-8 pb-20 mx-auto w-full pt-0 relative z-10"
      style={{ maxWidth: '1400px' }}
    >
      <div className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-white/[0.06]" style={{ gap: '24px', marginTop: 0, marginBottom: '32px', paddingTop: '8px' }}>
        <div>
          <h1 className="font-extrabold text-white tracking-tight" style={{ fontSize: '32px', marginBottom: '8px' }}>Settings</h1>
          <p className="text-[#94a3b8] font-medium" style={{ fontSize: '15px' }}>Manage your profile, security, and notification settings.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mt-2">
        {/* Navigation Sidebar */}
        <div className="w-full xl:w-72 flex flex-col gap-1.5 shrink-0">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center justify-between transition-all duration-200 group relative cursor-pointer ${
                 activeTab === tab.id 
                  ? 'bg-white/10 text-white border border-white/10 shadow-inner' 
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
               }`}
               style={{ padding: '12px 16px', borderRadius: '12px' }}
             >
               <div className="flex items-center gap-3">
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-[#06b6d4]' : 'text-[#52525b] group-hover:text-[#86868b]'} />
                  <span style={{ fontSize: '14px' }} className="font-bold">{tab.label}</span>
               </div>
               {activeTab === tab.id && (
                 <div className="rounded-full bg-[#06b6d4]" style={{ width: '4px', height: '14px' }} />
               )}
             </button>
           ))}
        </div>

        {/* Main Content Area */}
        <div 
          className="flex-1 overflow-hidden border border-white/[0.08]"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.035)', 
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            borderRadius: '24px', 
            minHeight: '550px', 
            boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)' 
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ padding: '32px' }} // Modals / large card padding is 32px
            >
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}> {/* Sections gap: 24px */}
                   <div className="flex justify-between items-start"> {/* Removed px-8 for proper edge alignment */}
                       <div>
                          <h3 className="font-extrabold text-white text-[20px]" style={{ marginBottom: '8px' }}>Profile Details</h3>
                          <p className="font-medium text-[#94a3b8]" style={{ fontSize: '14px' }}>Update your account information and how you appear to others.</p>
                       </div>
                      <div className="flex items-center justify-center border border-white/10" style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                         <User size={20} className="text-[#06b6d4]" />
                      </div>
                   </div>

                   {/* Image banner area padding: 28px (large card padding) */}
                   <div className="flex items-center border border-white/10" style={{ gap: '24px', padding: '28px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <div 
                        className="flex items-center justify-center font-extrabold border border-white/10 overflow-hidden" 
                        style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', fontSize: '24px' }}
                      >
                         {profileImage ? (
                           <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         ) : (
                           <span className="text-[#06b6d4]">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                         )}
                      </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[#86868b] font-bold tracking-wider uppercase" style={{ fontSize: '11px' }}>Profile Image</label>
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
                              gap: '8px', 
                              padding: '10px 18px', 
                              fontSize: '13px', 
                              borderRadius: '12px', 
                              background: 'linear-gradient(135deg, #2563EB, #06B6D4)', 
                              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                              border: 'none',
                            }}
                          >
                            <Camera size={16} />
                            Change Image
                          </button>
                       </div>
                   </div>

                    {/* Field spacing: 20px */}
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '20px' }}>
                       <GlassInput label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                       <GlassInput label="Email Address" value={user?.email} readOnly />
                    </div>

                   <div className="flex justify-end" style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                       <GlassButton icon={Save} onClick={onSave} loading={isSaving} className="!py-2.5 !px-5 font-bold">Save Changes</GlassButton>
                   </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}> {/* Sections gap: 24px */}
                    <div className="flex justify-between items-start">
                        <div>
                           <h3 className="font-extrabold text-white text-[20px]" style={{ marginBottom: '8px' }}>Security</h3>
                           <p className="font-medium text-[#94a3b8]" style={{ fontSize: '14px' }}>Manage your password, two-factor authentication, and account protection.</p>
                        </div>
                        <div className="flex items-center justify-center border border-white/10" style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                           <Lock size={20} className="text-[#ff3b30]" />
                        </div>
                    </div>

                    <div style={{ padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                       <div className="mx-auto mb-4 text-[#06b6d4] flex justify-center">
                         <Shield size={40} />
                       </div>
                       <h4 className="font-extrabold text-white text-md mb-2">Clerk Account Protection</h4>
                       <p className="font-medium text-[#86868b] max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                         Your account credentials, two-factor authentication, and session controls are securely managed by Clerk. Click the button below to update your security settings.
                       </p>
                       <button
                         onClick={() => clerk.openUserProfile()}
                         className="mx-auto flex items-center font-bold text-white cursor-pointer transition-all hover:opacity-90 active:scale-95"
                         style={{ 
                           gap: '8px', 
                           padding: '12px 24px', 
                           fontSize: '13px', 
                           borderRadius: '12px', 
                           background: 'linear-gradient(135deg, #2563EB, #06B6D4)', 
                           boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                           border: 'none',
                         }}
                       >
                         <Shield size={16} />
                         Manage Account Security
                       </button>
                    </div>

                    <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                       <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: 'rgba(255, 59, 48, 0.04)', border: '1px solid rgba(255, 59, 48, 0.12)' }}>
                        <div className="flex items-center text-[#ff3b30]" style={{ gap: '10px', marginBottom: '12px' }}>
                            <Trash2 size={18} />
                            <h4 className="font-extrabold uppercase tracking-wider text-[11px]">Danger Zone</h4>
                        </div>
                          <p className="font-medium text-[#94a3b8]" style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                             Deleting your account is permanent. All workflows, execution logs, and data will be wiped immediately.
                          </p>
                          <button
                            className="font-bold text-white cursor-pointer transition-all hover:opacity-90 active:scale-95"
                            style={{ 
                              padding: '10px 20px', fontSize: '13px', borderRadius: '12px', 
                              background: 'linear-gradient(135deg, #ff3b30, #ff2d55)', 
                              boxShadow: '0 4px 16px rgba(255, 59, 48, 0.3)', border: 'none' 
                            }}
                          >Delete My Account</button>
                       </div>
                    </div>
                </div>
              )}

              {activeTab === 'api_keys' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}> {/* Sections gap: 24px */}
                   <div className="flex justify-between items-center pb-6 border-b border-white/8">
                      <div>
                       <h3 className="font-extrabold text-white text-[20px]" style={{ marginBottom: '8px' }}>API Keys</h3>
                       <p className="font-medium text-[#94a3b8]" style={{ fontSize: '14px' }}>Use these keys to access our API from your own scripts.</p>
                     </div>
                       <button
                         onClick={generateKey}
                         className="flex items-center font-bold text-white cursor-pointer transition-all hover:opacity-90 active:scale-95"
                         style={{ 
                           gap: '8px', padding: '10px 18px', fontSize: '13px', borderRadius: '12px', 
                           background: 'linear-gradient(135deg, #2563EB, #06B6D4)', 
                           boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)', border: 'none' 
                         }}
                       >
                         <Plus size={16} />
                         Create Key
                       </button>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {isLoadingKeys ? (
                        <div className="text-center text-[#94a3b8] font-bold" style={{ padding: '48px 0', fontSize: '13px' }}>Loading keys...</div>
                      ) : apiKeys.length === 0 ? (
                         /* Empty states: Center content, padding 48px, gap 16px */
                          <div 
                            className="flex flex-col items-center justify-center border border-dashed border-white/10"
                            style={{ padding: '48px', gap: '16px', borderRadius: '20px' }}
                          >
                             <Key size={32} className="text-[#94a3b8] opacity-40" />
                             <span className="font-bold text-[#94a3b8] uppercase tracking-widest text-[11px]">No active keys</span>
                          </div>
                      ) : apiKeys.map(k => (
                        <div 
                          key={k.id} 
                          className="flex items-center justify-between hover:bg-white/5 transition-colors group border border-white/10"
                          style={{ padding: '16px 20px', borderRadius: '12px' }}
                        >
                           <div className="flex items-center" style={{ gap: '16px' }}>
                              <div 
                                className="flex items-center justify-center text-[#86868b] border border-white/10 group-hover:text-[#06b6d4] transition-colors"
                                style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                              >
                                 <Database size={18} />
                              </div>
                               <div>
                                  <div className="font-bold text-white" style={{ fontSize: '15px', marginBottom: '2px' }}>{k.name}</div>
                                  <div className="font-mono text-[#86868b]" style={{ fontSize: '11px' }}>Prefix: {k.prefix} • {new Date(k.created_at).toLocaleDateString()}</div>
                               </div>
                           </div>
                           <button 
                             onClick={() => deleteKey(k.id)} 
                             className="text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b3010] transition-colors"
                             style={{ padding: '8px', borderRadius: '8px' }}
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}> {/* Sections gap: 24px */}
                    <div>
                       <h3 className="font-extrabold text-white text-[20px]" style={{ marginBottom: '8px' }}>Notifications</h3>
                       <p className="font-medium text-[#94a3b8]" style={{ fontSize: '14px' }}>Manage how you receive alerts and updates.</p>
                    </div>

                    <div>
                       <div 
                         className="border border-white/10"
                         style={{ borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px' }}
                       >
                          <div style={{ padding: '16px 20px' }}>
                            <GlassToggle label="Workflow failure alerts" checked={true} />
                          </div>
                          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: '20px', marginRight: '20px' }} />
                          <div style={{ padding: '16px 20px' }}>
                            <GlassToggle label="Weekly summary emails" checked={false} />
                          </div>
                          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: '20px', marginRight: '20px' }} />
                          <div style={{ padding: '16px 20px' }}>
                            <GlassToggle label="New product features" checked={true} />
                          </div>
                          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: '20px', marginRight: '20px' }} />
                          <div style={{ padding: '16px 20px' }}>
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

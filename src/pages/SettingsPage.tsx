import React, { useState } from 'react';

/**
 * Settings page — extracted from App.tsx (lines 1001–1063).
 * Toggle state is local to this page (no need to share globally).
 */
export default function SettingsPage() {
  const [settingAlerts, setSettingAlerts] = useState(true);
  const [settingEmail, setSettingEmail]   = useState(true);
  const [settingSLA, setSettingSLA]       = useState(false);

  return (
    <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-6 max-w-2xl mx-auto shadow-2xl animate-in fade-in duration-200 select-none space-y-6">
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd]">System Administration Settings</h2>
        <p className="text-xs text-[#8e90a0] font-sans mt-0.5">Toggle alert profiles, notifications triggers, and compliance parameters.</p>
      </div>

      <div className="space-y-4 pt-2">

        {/* Toggle 1 */}
        <div className="flex items-center justify-between p-3.5 bg-[#1a1f32] border border-[#2a2d3e] rounded-lg">
          <div>
            <span className="block text-sm font-bold font-sans text-[#dee1fd]">Critial alerts notification routing</span>
            <span className="block text-xs text-[#8e90a0] font-sans mt-0.5">Route real-time websocket banners when S1 blocker bugs are registered.</span>
          </div>
          <button
            onClick={() => setSettingAlerts(!settingAlerts)}
            className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none ${settingAlerts ? 'bg-[#294fdb]' : 'bg-[#161a2e] border border-[#2a2d3e]'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${settingAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Toggle 2 */}
        <div className="flex items-center justify-between p-3.5 bg-[#1a1f32] border border-[#2a2d3e] rounded-lg">
          <div>
            <span className="block text-sm font-bold font-sans text-[#dee1fd]">Weekly email sprint digests logs</span>
            <span className="block text-xs text-[#8e90a0] font-sans mt-0.5">Receive structured bug resolution charts at each sprint termination cycle.</span>
          </div>
          <button
            onClick={() => setSettingEmail(!settingEmail)}
            className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none ${settingEmail ? 'bg-[#294fdb]' : 'bg-[#161a2e] border border-[#2a2d3e]'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${settingEmail ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Toggle 3 */}
        <div className="flex items-center justify-between p-3.5 bg-[#1a1f32] border border-[#2a2d3e] rounded-lg">
          <div>
            <span className="block text-sm font-bold font-sans text-[#dee1fd]">Enforce SLA policy validation limits</span>
            <span className="block text-xs text-[#8e90a0] font-sans mt-0.5">Trigger auto alerts to Leads if mitigation remains pending above 4 hours limits.</span>
          </div>
          <button
            onClick={() => setSettingSLA(!settingSLA)}
            className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none ${settingSLA ? 'bg-[#294fdb]' : 'bg-[#161a2e] border border-[#2a2d3e]'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${settingSLA ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

      </div>

      <div className="pt-4 border-t border-[#2a2d3e]/55 flex justify-end">
        <button
          onClick={() => alert('Settings Saved! PMS configurations updated inside active environment module.')}
          className="bg-[#294fdb] hover:bg-[#4a6cf7] text-white px-5 py-2 rounded-lg text-xs font-sans font-bold shadow-lg"
        >
          Save Workspace Profiles
        </button>
      </div>
    </div>
  );
}

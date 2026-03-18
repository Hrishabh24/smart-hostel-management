function AdminSettings() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">System Settings</h3>
        <p>Configure system preferences, notifications, and other settings here.</p>

        <div className="mt-6">
          <label className="block mb-2">Notification Settings</label>
          <input type="checkbox" className="mr-2" /> Enable email notifications
        </div>

        <div className="mt-4">
          <label className="block mb-2">Security Settings</label>
          <input type="checkbox" className="mr-2" /> Two-factor authentication
        </div>
      </div>
    </>
  );
}

export default AdminSettings;
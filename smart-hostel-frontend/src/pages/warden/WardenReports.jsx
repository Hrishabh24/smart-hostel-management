function WardenReports() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
          <h3 className="text-lg font-semibold mb-2">📊 Attendance Report</h3>
          <p className="text-gray-400 text-sm">Generate and download attendance statistics for selected period.</p>
          <button className="mt-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-2 rounded hover:bg-[#131B2F]/10 font-semibold">
            Generate Report
          </button>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
          <h3 className="text-lg font-semibold mb-2">📋 Leave Report</h3>
          <p className="text-gray-400 text-sm">View and download leave approval history.</p>
          <button className="mt-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-2 rounded hover:bg-[#131B2F]/10 font-semibold">
            Generate Report
          </button>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
          <h3 className="text-lg font-semibold mb-2">🔴 Complaints Report</h3>
          <p className="text-gray-400 text-sm">Analyze complaints trends and resolutions.</p>
          <button className="mt-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-2 rounded hover:bg-[#131B2F]/10 font-semibold">
            Generate Report
          </button>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
          <h3 className="text-lg font-semibold mb-2">👥 Student Activity Report</h3>
          <p className="text-gray-400 text-sm">Comprehensive report on student activities and conduct.</p>
          <button className="mt-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-2 rounded hover:bg-[#131B2F]/10 font-semibold">
            Generate Report
          </button>
        </div>
      </div>
    </>
  );
}

export default WardenReports;
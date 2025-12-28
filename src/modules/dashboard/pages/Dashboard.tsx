
const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    New Appointment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                    <div className="mt-4 flex items-center text-green-600 text-sm">
                        <span>+12% from last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Appointments Today</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">42</p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm">
                        <span>8 upcoming</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Lab Results</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">7</p>
                    <div className="mt-4 flex items-center text-orange-600 text-sm">
                        <span>Action required</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-500">No recent activity.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

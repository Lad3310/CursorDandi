export function CurrentPlan() {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl p-8 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">CURRENT PLAN</h2>
        <button className="bg-white text-orange-500 px-4 py-2 rounded-full text-sm">Manage Plan</button>
      </div>
      <h3 className="text-4xl font-bold mb-4">Researcher</h3>
      <p className="mb-2">API Limit</p>
      <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
        <div className="bg-white h-full rounded-full" style={{width: '0%'}}></div>
      </div>
      <p>0 / 1,000 Requests</p>
    </div>
  );
}

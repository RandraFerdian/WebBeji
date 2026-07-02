const LoadingState = () => {
  return (
    <div className="animate-pulse space-y-6 w-full">
      <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export default LoadingState;

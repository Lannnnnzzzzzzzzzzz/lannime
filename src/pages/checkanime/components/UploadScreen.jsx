const UploadScreen = ({ onFileSelect, error, fileInputRef }) => {
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
             <div
                className="w-full max-w-2xl p-8 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl cursor-pointer transition-all duration-300 hover:border-blue-500 hover:scale-105"
                onClick={handleClick}
            >
                <div className="flex flex-col items-center justify-center">
                    <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-200">
                        Screenshot or Upload Anime Scene
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Paste (ctrl + v) or upload scene here
                    </p>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
            {error && (
                <div className="mt-6 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg max-w-2xl text-center">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}
            <footer className="absolute bottom-4 text-gray-600 text-sm">
                Powered by trace.moe
            </footer>
        </div>
    );
};

export default UploadScreen;

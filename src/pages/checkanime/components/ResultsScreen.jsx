import { useState } from 'react';
import ResultItem from './ResultItem';
import ResultDetail from './ResultDetail';

const ResultsScreen = ({
    userImage,
    results,
    selectedResult,
    onSelectResult,
    anilistInfo,
    isAnilistLoading,
    onSearchAgain,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800/50 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-700">
                <h1 className="text-lg md:text-xl font-bold">Found It!</h1>

                <button
                    onClick={onSearchAgain}
                    className="hidden md:flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Again
                </button>

                <div className="md:hidden relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white focus:outline-none p-2 rounded-md hover:bg-gray-700"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-20 border border-gray-600"
                            role="menu"
                        >
                            <button
                                onClick={() => {
                                    onSearchAgain();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-blue-600 flex items-center transition-colors duration-150"
                                role="menuitem"
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Search Again</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <aside className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-gray-800 rounded-lg p-3">
                        <h2 className="text-lg font-semibold mb-3 text-gray-300">Your Search Image</h2>
                        <img src={userImage} alt="User upload" className="rounded-md w-full object-cover" />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 flex-grow">
                         <h2 className="text-lg font-semibold mb-3 text-gray-300">Results</h2>
                        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                           {results.map((result, index) => (
                                <ResultItem
                                    key={`${result.anilist}-${result.from}-${index}`}
                                    result={result}
                                    isActive={selectedResult?.from === result.from && selectedResult?.anilist === result.anilist}
                                    onClick={() => onSelectResult(result)}
                                />
                           ))}
                        </div>
                    </div>
                </aside>

                <section className="lg:col-span-2">
                    <ResultDetail
                        result={selectedResult}
                        anilistInfo={anilistInfo}
                        isLoading={isAnilistLoading}
                    />
                </section>
            </main>
        </div>
    );
};

export default ResultsScreen;

import { useState, useEffect, useCallback, useRef } from 'react';
import { uploadImage, searchAnimeScene, getAnilistInfo } from './services/api';
import UploadScreen from './components/UploadScreen';
import ResultsScreen from './components/ResultsScreen';
import Loader from './components/Loader';

const CheckAnime = () => {
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const [userImagePreview, setUserImagePreview] = useState(null);
    const [traceMoeResults, setTraceMoeResults] = useState([]);
    const [selectedTraceMoeResult, setSelectedTraceMoeResult] = useState(null);
    const [anilistInfo, setAnilistInfo] = useState(null);
    const [isAnilistLoading, setIsAnilistLoading] = useState(false);
    const fileInputRef = useRef(null);

    const resetState = () => {
        setStatus('idle');
        setError(null);
        setUserImagePreview(null);
        setTraceMoeResults([]);
        setSelectedTraceMoeResult(null);
        setAnilistInfo(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileSelect = useCallback(async (file) => {
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.');
            setStatus('error');
            return;
        }

        resetState();
        setStatus('uploading');

        const previewUrl = URL.createObjectURL(file);
        setUserImagePreview(previewUrl);

        try {
            const tempFileUrl = await uploadImage(file);
            setStatus('searching');

            const searchResults = await searchAnimeScene(tempFileUrl);
            if (searchResults && searchResults.length > 0) {
                setTraceMoeResults(searchResults);
                setSelectedTraceMoeResult(searchResults[0]);
                setStatus('success');
            } else {
                setError('No results found for this image.');
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setStatus('error');
        }
    }, []);

    const handleResultSelect = useCallback((result) => {
        setSelectedTraceMoeResult(result);
    }, []);

    useEffect(() => {
        if (!selectedTraceMoeResult) {
            setAnilistInfo(null);
            return;
        }

        const fetchAnilistData = async () => {
            setIsAnilistLoading(true);
            setAnilistInfo(null);
            try {
                const data = await getAnilistInfo(selectedTraceMoeResult.anilist);
                setAnilistInfo(data);
            } catch (err) {
                console.error("Failed to fetch AniList info:", err);
            } finally {
                setIsAnilistLoading(false);
            }
        };

        fetchAnilistData();
    }, [selectedTraceMoeResult]);

    useEffect(() => {
        const handlePaste = (event) => {
            const items = event.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                            handleFileSelect(file);
                        }
                        break;
                    }
                }
            }
        };

        const handleDrop = (event) => {
            event.preventDefault();
            document.body.classList.remove('border-dashed', 'border-blue-500', 'border-4');
            const files = event.dataTransfer?.files;
            if (files && files.length > 0) {
                if(files[0].type.startsWith('image/')) {
                    handleFileSelect(files[0]);
                }
            }
        };

        const handleDragOver = (event) => {
            event.preventDefault();
            document.body.classList.add('border-dashed', 'border-blue-500', 'border-4');
        };

        const handleDragLeave = (event) => {
            event.preventDefault();
            document.body.classList.remove('border-dashed', 'border-blue-500', 'border-4');
        };

        window.addEventListener('paste', handlePaste);
        window.addEventListener('drop', handleDrop);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragleave', handleDragLeave);

        return () => {
            window.removeEventListener('paste', handlePaste);
            window.removeEventListener('drop', handleDrop);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragleave', handleDragLeave);
        };
    }, [handleFileSelect]);

    const renderContent = () => {
        if (status === 'idle' || status === 'error') {
            return (
              <UploadScreen
                onFileSelect={handleFileSelect}
                error={error}
                fileInputRef={fileInputRef}
              />
            );
        }

        if (status === 'uploading' || status === 'searching') {
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <Loader />
                    <p className="mt-4 text-lg text-gray-300">
                        {status === 'uploading' ? 'Uploading image...' : 'Finding anime scene...'}
                    </p>
                    {userImagePreview && <img src={userImagePreview} alt="Uploading preview" className="mt-4 max-h-48 rounded-lg shadow-lg" />}
                </div>
            );
        }

        if (status === 'success' && userImagePreview && traceMoeResults.length > 0) {
            return (
                <ResultsScreen
                    userImage={userImagePreview}
                    results={traceMoeResults}
                    selectedResult={selectedTraceMoeResult}
                    onSelectResult={handleResultSelect}
                    anilistInfo={anilistInfo}
                    isAnilistLoading={isAnilistLoading}
                    onSearchAgain={resetState}
                />
            );
        }

        return null;
    };

    return <div className="min-h-screen bg-gray-900 text-white">{renderContent()}</div>;
};

export default CheckAnime;

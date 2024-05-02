import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const ContinuousSpeechRecognition = ({ onSearch, onStop, onReset, setTranscript }) => {
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (transcript !== '') {
      setTranscript(transcript);
      onSearch();
    }
  }, [transcript, setTranscript, onSearch]);

  useEffect(() => {
    if (!isListening) {
      resetTranscript();
      onStop(transcript);
    }
  }, [isListening, resetTranscript, onStop, transcript]);

  const handleStartListening = () => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    } else {
      console.error('Speech recognition not supported');
    }
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    setIsListening(false);
  };

  const handleReset = () => {
    resetTranscript();
    onReset();
    setIsListening(false);
  };

  return (

    <div>
      <h1 className='text-xl'></h1>
      <p>Transcript: {transcript}</p>
      {/* <button onClick={isListening ? handleStopListening : handleStartListening}>
        {isListening ? 'Stop' : 'Start'}
      </button> */}
      {/* <button onClick={handleReset} disabled={!isListening}>
        Reset
      </button> */}
    
    <div className="mt-10 flex items-center justify-center gap-x-2">
              <button
                type="button"
                onClick={isListening ? handleStopListening : handleStartListening}
                className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {isListening ? 'Stop' : 'Start'}
              </button>
              <button
                type="button"
                onClick={handleReset} disabled={!isListening}
                className="rounded-md border border-black px-4 py-2 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Reset
              </button>
      </div>
    </div>
  );
};

export default ContinuousSpeechRecognition;
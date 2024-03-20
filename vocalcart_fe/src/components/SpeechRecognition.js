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
      <h1>Continuous Speech Recognition</h1>
      <p>Transcript: {transcript}</p>
      <button onClick={isListening ? handleStopListening : handleStartListening}>
        {isListening ? 'Stop' : 'Start'}
      </button>
      <button onClick={handleReset} disabled={!isListening}>
        Reset
      </button>
    </div>
  );
};

export default ContinuousSpeechRecognition;
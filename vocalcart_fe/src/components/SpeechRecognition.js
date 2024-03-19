import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const ContinuousSpeechRecognition = ({ onSearch, onStop, onReset, setTranscript, listening }) => {
  const { transcript, resetTranscript } = useSpeechRecognition();

  const startRecognition = () => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      SpeechRecognition.startListening();
    } else {
      console.error('Speech recognition not supported');
    }
  };

  const stopRecognition = () => {
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    startRecognition();

    return () => {
      stopRecognition();
    };
  }, []); // Run only once when the component mounts

  useEffect(() => {
    if (transcript !== '') {
      setTranscript(transcript);
      onSearch(); // Trigger the search in the parent component
    }
  }, [transcript, setTranscript, onSearch]);

  useEffect(() => {
    if (!listening) {
      resetTranscript();
      onStop(transcript); // Trigger the stop action in the parent component
    }
  }, [listening, resetTranscript, onStop, transcript]);

  return (
    <div>
      <h1>Continuous Speech Recognition</h1>
      <p>Transcript: {transcript}</p>
      <button onClick={stopRecognition}>Stop</button>
      <button onClick={onReset}>Reset</button>
    </div>
  );
};

export default ContinuousSpeechRecognition;

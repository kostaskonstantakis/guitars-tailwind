// Guitar Collection Audio - Background Music + Hover Melodies
// Χρησιμοποιεί Web Audio API για αρπέτα background + hover συχνότητες

(function() {
    'use strict';

    // Audio Context
    var audioContext = null;
    var backgroundOscillator = null;
    var backgroundGain = null;
    var isBackgroundPlaying = false;

    // Note frequencies (A4 = 440Hz)
    var noteFrequencies = {
        'C4': 261.63,
        'D4': 293.66,
        'E4': 329.63,
        'F4': 349.23,
        'G4': 392.00,
        'A4': 440.00,
        'B4': 493.88,
        'C5': 523.25,
        'D5': 587.33,
        'E5': 659.25,
        'F5': 698.46,
        'G5': 783.99,
        'A5': 880.00
    };

    // Hover notes for each guitar (8 guitars = 8 different notes)
    var hoverNotes = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B4', 'C4'];

    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    // Background Arpeggio (παίζει ένα απλό riff)
    function startBackgroundArpeggio() {
        if (isBackgroundPlaying) return;
        
        initAudioContext();
        isBackgroundPlaying = true;

        // Arpeggio sequence
        var arpSequence = ['G4', 'B4', 'D5', 'G5', 'D5', 'B4'];
        var noteIndex = 0;
        var noteTime = 0.4; // 400ms per note

        function playNextNote() {
            if (!isBackgroundPlaying) return;

            var note = arpSequence[noteIndex % arpSequence.length];
            var frequency = noteFrequencies[note];

            var osc = audioContext.createOscillator();
            var gain = audioContext.createGain();
            var filter = audioContext.createBiquadFilter();

            // Smooth gain envelope
            gain.gain.setValueAtTime(0.15, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + noteTime * 0.8);

            osc.frequency.value = frequency;
            osc.type = 'triangle'; // Мягче звук для фона
            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioContext.destination);

            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + noteTime * 0.9);

            noteIndex++;
            setTimeout(playNextNote, noteTime * 1000);
        }

        playNextNote();
    }

    function stopBackgroundArpeggio() {
        isBackgroundPlaying = false;
    }

    // Hover Sound (κάθε κιθάρα παίζει ένα διαφορετικό note)
    function playHoverNote(guitarIndex) {
        initAudioContext();

        var note = hoverNotes[guitarIndex % hoverNotes.length];
        var frequency = noteFrequencies[note];

        var osc = audioContext.createOscillator();
        var gain = audioContext.createGain();
        var filter = audioContext.createBiquadFilter();

        // Pluck envelope - σαν κιθάρα που παίζεις
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        osc.frequency.value = frequency;
        osc.type = 'sawtooth'; // Κιθάρα-like timbre
        filter.type = 'highpass';
        filter.frequency.value = 1500;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.3);
    }

    // Κύρια λογική
    window.GuitarAudio = {
        start: startBackgroundArpeggio,
        stop: stopBackgroundArpeggio,
        playNote: playHoverNote,
        isPlaying: function() { return isBackgroundPlaying; }
    };

    // Auto-start background on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            startBackgroundArpeggio();
        });
    } else {
        startBackgroundArpeggio();
    }

    // Stop on page unload
    window.addEventListener('beforeunload', function() {
        stopBackgroundArpeggio();
    });

    // Attach hover listeners to guitar sections
    setTimeout(function() {
        var guitarSections = document.querySelectorAll('.guitar-section');
        guitarSections.forEach(function(section, index) {
            section.addEventListener('mouseenter', function() {
                playHoverNote(index);
            });
        });
    }, 500);
})();

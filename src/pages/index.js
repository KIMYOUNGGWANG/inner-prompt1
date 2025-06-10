import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { emotionCache } from '../data/emotionCache';
import Head from 'next/head';
import { generatePrompts } from '../utils/api';
import { generatePDF } from '../utils/pdf';
import AdSense from '../components/AdSense';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Link from 'next/link';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EMOTION_SUGGESTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😱', label: 'Anxious' },
  { emoji: '😍', label: 'Love' },
  { emoji: '😔', label: 'Lonely' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😇', label: 'Grateful' },
  { emoji: '😴', label: 'Tired' },
];

const EMOTION_ILLUSTRATIONS = {
  Happy: '🌞',
  Sad: '🌧️',
  Angry: '🌋',
  Calm: '🌊',
  Anxious: '🌪️',
  Love: '💖',
  Lonely: '🌙',
  Frustrated: '🔥',
  Grateful: '🌈',
  Tired: '😴',
};

const EMOTION_QUOTES = {
  Happy: [
    'Happiness is not by chance, but by choice. – Jim Rohn',
    'Let your smile change the world.',
    'Joy is the simplest form of gratitude.'
  ],
  Sad: [
    'Tears are words that need to be written. – Paulo Coelho',
    'It\'s okay to feel sad. This too shall pass.',
    'Sadness flies away on the wings of time.'
  ],
  Angry: [
    'For every minute you are angry you lose sixty seconds of happiness. – Emerson',
    'Breathe in calm, breathe out anger.',
    'Anger is one letter short of danger.'
  ],
  Calm: [
    'Peace comes from within. – Buddha',
    'Keep calm and carry on.',
    'Serenity is not freedom from the storm, but peace amid the storm.'
  ],
  Anxious: [
    'You don\'t have to control your thoughts. You just have to stop letting them control you. – Dan Millman',
    'This feeling is temporary. You are safe.',
    'Breathe. You are stronger than you think.'
  ],
  Love: [
    'Where there is love, there is life. – Gandhi',
    'You are loved more than you know.',
    'Love is the bridge between you and everything.'
  ],
  Lonely: [
    'You are never alone. You are eternally connected with everyone. – Amit Ray',
    'Solitude is the soul\'s holiday.',
    'Reach out. Someone cares.'
  ],
  Frustrated: [
    'Frustration is fuel that can lead to the development of an innovative and useful idea. – Marley Dias',
    'Take a break. You\'re doing your best.',
    'Every struggle is a step forward.'
  ],
  Grateful: [
    'Gratitude turns what we have into enough.',
    'Start each day with a grateful heart.',
    'Gratitude is the fairest blossom which springs from the soul.'
  ],
  Tired: [
    'Rest is not idleness.',
    'Take time to recharge. You deserve it.',
    'Even the sun needs to set to rise again.'
  ],
};

const EMOTION_MUSIC = {
  Happy: {
    title: 'Happy Vibes Playlist',
    url: 'https://www.youtube.com/embed/ZbZSe6N_BXs',
  },
  Sad: {
    title: 'Calm Piano for Sad Days',
    url: 'https://www.youtube.com/embed/4Tr0otuiQuU',
  },
  Angry: {
    title: 'Chill Out Music',
    url: 'https://www.youtube.com/embed/2OEL4P1Rz04',
  },
  Calm: {
    title: 'Ocean Waves for Relaxation',
    url: 'https://www.youtube.com/embed/B4nA5Ue3g1w',
  },
  Anxious: {
    title: 'Peaceful Mindfulness Music',
    url: 'https://www.youtube.com/embed/1ZYbU82GVz4',
  },
  Love: {
    title: 'Romantic Jazz',
    url: 'https://www.youtube.com/embed/VMnjF1O4eH0',
  },
  Lonely: {
    title: 'Soothing Acoustic',
    url: 'https://www.youtube.com/embed/1ZYbU82GVz4',
  },
  Frustrated: {
    title: 'Stress Relief Music',
    url: 'https://www.youtube.com/embed/2OEL4P1Rz04',
  },
  Grateful: {
    title: 'Gratitude Meditation',
    url: 'https://www.youtube.com/embed/8a8Bf5hF0sY',
  },
  Tired: {
    title: 'Deep Sleep Music',
    url: 'https://www.youtube.com/embed/Mk7-GRWq7wA',
  },
};

function getJournalHistory() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('journalHistory') || '[]');
  } catch {
    return [];
  }
}

function saveJournalEntry(entry) {
  if (typeof window === 'undefined') return;
  const history = getJournalHistory();
  history.unshift(entry);
  localStorage.setItem('journalHistory', JSON.stringify(history.slice(0, 50)));
}

function getRandomQuote(emotion) {
  const quotes = EMOTION_QUOTES[emotion];
  if (!quotes) return '';
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default function Home() {
  const [emotion, setEmotion] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [journalHistory, setJournalHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [quote, setQuote] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [aiEmotion, setAiEmotion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const modalRef = useRef(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Emotion Frequency',
        data: [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  });

  const currentIllustration = EMOTION_ILLUSTRATIONS[emotion] || '🌊';
  const music = EMOTION_MUSIC[emotion];

  useEffect(() => {
    setJournalHistory(getJournalHistory());
  }, [showHistory]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    setQuote(getRandomQuote(emotion));
  }, [emotion]);

  useEffect(() => {
    if (!showHistory) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setShowHistory(false);
    }
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHistory]);

  useEffect(() => {
    const history = getJournalHistory();
    const emotionCount = {};
    history.forEach(entry => {
      emotionCount[entry.emotion] = (emotionCount[entry.emotion] || 0) + 1;
    });

    setChartData({
      labels: Object.keys(emotionCount),
      datasets: [
        {
          label: 'Emotion Frequency',
          data: Object.values(emotionCount),
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, [journalHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emotion.trim()) {
      setError('Please enter an emotion');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const cachedPrompts = emotionCache[emotion.toLowerCase()];
      let promptsToSave;
      if (cachedPrompts) {
        setPrompts(cachedPrompts);
        promptsToSave = cachedPrompts;
      } else {
        const generatedPrompts = await generatePrompts(emotion);
        setPrompts(generatedPrompts);
        promptsToSave = generatedPrompts;
      }
      saveJournalEntry({
        date: new Date().toISOString(),
        emotion,
        prompts: promptsToSave,
        answer,
      });
      setJournalHistory(getJournalHistory());
    } catch (err) {
      setError('Failed to generate prompts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await generatePDF({
        emotion,
        prompts,
        answer,
        date: new Date().toLocaleDateString(),
      });
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  async function handleAnalyzeEmotion() {
    if (!answer.trim()) {
      setAiError('Please write something first');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: answer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAiEmotion(data.emotion);
    } catch (err) {
      setAiError('Failed to analyze emotion. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Head>
        <title>InnerPrompt - Emotional Journaling</title>
        <meta name="description" content="Explore your emotions through guided journaling prompts" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">
              InnerPrompt
            </h1>
            <p className="text-xl text-indigo-600 dark:text-indigo-300">
              Explore your emotions through guided journaling prompts
            </p>
          </motion.div>
          <Link
            href="/statistics"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105"
          >
            View Statistics
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100 dark:border-indigo-900"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="emotion" className="block text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                  How are you feeling today?
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="emotion"
                    id="emotion"
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-lg border-indigo-200 rounded-xl dark:bg-gray-700 dark:border-indigo-800 dark:text-white p-3 transition-colors duration-200"
                    placeholder="Enter your emotion..."
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {EMOTION_SUGGESTIONS.map(({ emoji, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setEmotion(label)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 transition-all duration-200 hover:scale-105"
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="answer" className="block text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                  Your Response
                </label>
                <div className="mt-1">
                  <textarea
                    id="answer"
                    name="answer"
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-lg border-indigo-200 rounded-xl dark:bg-gray-700 dark:border-indigo-800 dark:text-white p-3 transition-colors duration-200"
                    placeholder="Write your thoughts here..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className="inline-flex items-center px-6 py-3 border border-indigo-200 shadow-sm text-base font-medium rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                >
                  View History
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  {loading ? <LoadingSpinner /> : 'Generate Prompts'}
                </button>
              </div>
            </form>

            <AdSense />

            {error && <ErrorMessage message={error} />}

            {prompts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Generated Prompts</h2>
                <div className="space-y-4">
                  {prompts.map((prompt, index) => (
                    <div
                      key={index}
                      className="bg-indigo-50 dark:bg-indigo-900/50 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800"
                    >
                      <p className="text-lg text-indigo-700 dark:text-indigo-300">{prompt}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                  >
                    {pdfLoading ? <LoadingSpinner /> : 'Download PDF'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {quote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100 dark:border-indigo-900"
              >
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">Daily Quote</h2>
                <p className="text-xl text-indigo-600 dark:text-indigo-300 italic">"{quote}"</p>
              </motion.div>
            )}

            {music && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100 dark:border-indigo-900"
              >
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">{music.title}</h2>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={music.url}
                    title={music.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-xl"
                  />
                </div>
              </motion.div>
            )}

            {answer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100 dark:border-indigo-900"
              >
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Emotion Analysis</h2>
                <div className="space-y-6">
                  <button
                    onClick={handleAnalyzeEmotion}
                    disabled={aiLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                  >
                    {aiLoading ? <LoadingSpinner /> : 'Analyze Emotion'}
                  </button>
                  {aiError && <ErrorMessage message={aiError} />}
                  {aiEmotion && (
                    <div className="text-center">
                      <p className="text-8xl mb-4">{EMOTION_ILLUSTRATIONS[aiEmotion]}</p>
                      <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{aiEmotion}</p>
                    </div>
                  )}
                </div>

                <AdSense />
              </motion.div>
            )}

            {journalHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100 dark:border-indigo-900"
              >
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Emotion Trends</h2>
                <div className="h-64">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          },
                          grid: {
                            color: 'rgba(99, 102, 241, 0.1)',
                          },
                        },
                        x: {
                          grid: {
                            color: 'rgba(99, 102, 241, 0.1)',
                          },
                        },
                      },
                    }}
                  />
                </div>

                <AdSense />
              </motion.div>
            )}
          </div>
        </div>

        {showHistory && (
          <div className="fixed inset-0 bg-indigo-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              ref={modalRef}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-indigo-100 dark:border-indigo-900"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">Journal History</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-indigo-400 hover:text-indigo-500 transition-colors duration-200"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  {journalHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="bg-indigo-50 dark:bg-indigo-900/50 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-indigo-500 dark:text-indigo-400">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                          <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
                            {entry.emotion}
                          </p>
                        </div>
                        <p className="text-5xl">{EMOTION_ILLUSTRATIONS[entry.emotion]}</p>
                      </div>
                      <div className="space-y-3">
                        {entry.prompts.map((prompt, promptIndex) => (
                          <p
                            key={promptIndex}
                            className="text-lg text-indigo-700 dark:text-indigo-300"
                          >
                            {prompt}
                          </p>
                        ))}
                      </div>
                      {entry.answer && (
                        <div className="mt-4">
                          <p className="text-base font-medium text-indigo-700 dark:text-indigo-300">Your Response:</p>
                          <p className="mt-2 text-lg text-indigo-600 dark:text-indigo-400">{entry.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          <AdSense />
        </div>
      </main>
    </div>
  );
} 
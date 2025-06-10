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

const EMOTION_FEEDBACK = {
  Happy: {
    tip: '오늘의 행복을 주변 사람과 나눠보세요!',
    activity: '산책하며 기분 좋은 음악 듣기',
    quote: 'Happiness is not by chance, but by choice. – Jim Rohn',
    music: 'https://www.youtube.com/embed/ZbZSe6N_BXs',
  },
  Sad: {
    tip: '마음이 힘들 땐 잠시 쉬어가도 괜찮아요.',
    activity: '따뜻한 차 한잔 마시기',
    quote: 'Tears are words that need to be written. – Paulo Coelho',
    music: 'https://www.youtube.com/embed/4Tr0otuiQuU',
  },
  Angry: {
    tip: '깊게 숨을 들이마시고 천천히 내쉬어보세요.',
    activity: '조용한 곳에서 명상하기',
    quote: 'For every minute you are angry you lose sixty seconds of happiness. – Emerson',
    music: 'https://www.youtube.com/embed/2OEL4P1Rz04',
  },
  Calm: {
    tip: '이 평온함을 오래 간직해보세요.',
    activity: '자연 소리 들으며 휴식하기',
    quote: 'Peace comes from within. – Buddha',
    music: 'https://www.youtube.com/embed/B4nA5Ue3g1w',
  },
  Anxious: {
    tip: '불안할 땐 천천히 호흡을 가다듬어보세요.',
    activity: '마음챙김 명상 앱 사용해보기',
    quote: 'You don\'t have to control your thoughts. You just have to stop letting them control you. – Dan Millman',
    music: 'https://www.youtube.com/embed/1ZYbU82GVz4',
  },
  Love: {
    tip: '사랑하는 마음을 표현해보세요.',
    activity: '고마운 사람에게 메시지 보내기',
    quote: 'Where there is love, there is life. – Gandhi',
    music: 'https://www.youtube.com/embed/VMnjF1O4eH0',
  },
  Lonely: {
    tip: '혼자여도 괜찮아요. 나 자신을 더 아껴주세요.',
    activity: '좋아하는 영화 보기',
    quote: 'You are never alone. You are eternally connected with everyone. – Amit Ray',
    music: 'https://www.youtube.com/embed/1ZYbU82GVz4',
  },
  Frustrated: {
    tip: '잠시 멈추고 심호흡을 해보세요.',
    activity: '가벼운 스트레칭',
    quote: 'Frustration is fuel that can lead to the development of an innovative and useful idea. – Marley Dias',
    music: 'https://www.youtube.com/embed/2OEL4P1Rz04',
  },
  Grateful: {
    tip: '감사한 마음을 일기로 남겨보세요.',
    activity: '감사 일기 쓰기',
    quote: 'Gratitude turns what we have into enough.',
    music: 'https://www.youtube.com/embed/8a8Bf5hF0sY',
  },
  Tired: {
    tip: '충분한 휴식이 필요해요. 오늘은 일찍 쉬어보세요.',
    activity: '따뜻한 물로 반신욕',
    quote: 'Rest is not idleness.',
    music: 'https://www.youtube.com/embed/Mk7-GRWq7wA',
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
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-300 to-emerald-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            <h1 className="text-5xl font-bold text-sky-700 dark:text-sky-100 mb-4 drop-shadow-lg">
              InnerPrompt
            </h1>
            <p className="text-xl text-emerald-700 dark:text-emerald-300">
              Surf your emotions, ride the wave of your mind
            </p>
          </motion.div>
          <Link
            href="/statistics"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-emerald-400 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-all duration-200 hover:scale-105"
          >
            View Statistics
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-sky-100 dark:border-sky-900 mb-6 sm:mb-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="emotion" className="block text-lg font-medium text-sky-700 dark:text-sky-300 mb-2">
                  How are you feeling today?
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="emotion"
                    id="emotion"
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    className="shadow-sm focus:ring-emerald-400 focus:border-emerald-400 block w-full text-base sm:text-lg border-sky-200 rounded-xl dark:bg-gray-700 dark:border-sky-800 dark:text-white p-2 sm:p-3 transition-colors duration-200"
                    placeholder="Enter your emotion..."
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {EMOTION_SUGGESTIONS.map(({ emoji, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setEmotion(label)}
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-base sm:text-lg font-medium rounded-xl shadow-sm text-white bg-emerald-400 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-all duration-200 hover:scale-105"
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="answer" className="block text-lg font-medium text-sky-700 dark:text-sky-300 mb-2">
                  Your Response
                </label>
                <div className="mt-1">
                  <textarea
                    id="answer"
                    name="answer"
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="shadow-sm focus:ring-emerald-400 focus:border-emerald-400 block w-full text-base sm:text-lg border-sky-200 rounded-xl dark:bg-gray-700 dark:border-sky-800 dark:text-white p-2 sm:p-3 transition-colors duration-200"
                    placeholder="Write your thoughts here..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className="inline-flex items-center px-6 py-3 border border-sky-200 shadow-sm text-base font-medium rounded-xl text-sky-700 bg-white hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 dark:bg-gray-700 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                >
                  View History
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-emerald-400 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  {loading ? <LoadingSpinner /> : 'Generate Prompts'}
                </button>
              </div>
            </form>
            <AdSense />
            {error && <ErrorMessage message={error} />}
          </motion.div>

          {prompts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-sky-100 dark:border-sky-900 mb-6 sm:mb-8"
            >
              <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-100 mb-6">Prompts</h2>
              <ul className="list-disc pl-6 space-y-2">
                {prompts.map((prompt, idx) => (
                  <li key={idx} className="text-lg text-sky-800 dark:text-sky-200">{prompt}</li>
                ))}
              </ul>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-emerald-400 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  {pdfLoading ? <LoadingSpinner /> : 'Download PDF'}
                </button>
              </div>
            </motion.div>
          )}

          {quote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-sky-100 dark:border-sky-900 mb-6 sm:mb-8"
            >
              <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-100 mb-6">Quote</h2>
              <p className="text-lg text-sky-800 dark:text-sky-200">{quote}</p>
            </motion.div>
          )}

          {music && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-sky-100 dark:border-sky-900 mb-6 sm:mb-8"
            >
              <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-100 mb-6">Music Recommendation</h2>
              <iframe
                title={music.title}
                width="100%"
                height="80"
                src={music.url}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl shadow"
              />
              <p className="text-lg text-sky-800 dark:text-sky-200 mt-4">{music.title}</p>
            </motion.div>
          )}

          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-sky-100 dark:border-sky-900 mb-6 sm:mb-8"
            >
              <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-100 mb-6">Emotion Analysis</h2>
              <div className="space-y-6">
                <button
                  onClick={handleAnalyzeEmotion}
                  disabled={aiLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-emerald-400 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  {aiLoading ? <LoadingSpinner /> : 'Analyze Emotion'}
                </button>
                {aiError && <ErrorMessage message={aiError} />}
                {aiEmotion && (
                  <div className="text-center">
                    <p className="text-8xl mb-4">{EMOTION_ILLUSTRATIONS[aiEmotion]}</p>
                    <p className="text-2xl font-bold text-sky-700 dark:text-sky-100">{aiEmotion}</p>
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
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-sky-200 dark:border-sky-900 mb-6 sm:mb-8"
            >
              <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-100 mb-6 flex items-center gap-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#38bdf8" fillOpacity="0.7" d="M2 20s2-4 10-4 10 4 10 4v2H2v-2Z"/><path fill="#0ea5e9" fillOpacity="0.7" d="M12 2a6 6 0 0 1 6 6c0 2.5-2.5 6-6 10C8.5 14 6 10.5 6 8a6 6 0 0 1 6-6Z"/></svg>
                Emotion Trends
              </h2>
              <div className="h-64 sm:h-80 w-full overflow-x-auto">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(56, 189, 248, 0.12)' },
                      },
                      x: {
                        grid: { color: 'rgba(56, 189, 248, 0.08)' },
                      },
                    },
                  }}
                />
              </div>
              <AdSense />
            </motion.div>
          )}

          {emotion && EMOTION_FEEDBACK[emotion] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-sky-50 dark:bg-sky-900/60 rounded-2xl shadow-lg p-6 border border-sky-200 dark:border-sky-800 mb-8 max-w-xl mx-auto w-full"
            >
              <h3 className="text-xl font-bold text-sky-700 dark:text-sky-100 mb-2 flex items-center gap-2">
                <span>{EMOTION_ILLUSTRATIONS[emotion]}</span> 맞춤 피드백
              </h3>
              <p className="text-lg text-sky-800 dark:text-sky-200 mb-2"><b>명언:</b> {EMOTION_FEEDBACK[emotion].quote}</p>
              <p className="text-lg text-sky-800 dark:text-sky-200 mb-2"><b>자기돌봄 팁:</b> {EMOTION_FEEDBACK[emotion].tip}</p>
              <p className="text-lg text-sky-800 dark:text-sky-200 mb-2"><b>추천 활동:</b> {EMOTION_FEEDBACK[emotion].activity}</p>
              <div className="mt-4">
                <iframe
                  title="추천 음악"
                  width="100%"
                  height="80"
                  src={EMOTION_FEEDBACK[emotion].music}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-xl shadow"
                />
              </div>
            </motion.div>
          )}
        </div>

        {showHistory && (
          <div className="fixed inset-0 bg-sky-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full border border-sky-200 dark:border-sky-800">
              <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-100 mb-6">Journal History</h2>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {journalHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-sky-50 dark:bg-sky-900/50 rounded-xl p-6 border border-sky-100 dark:border-sky-800"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-sky-500 dark:text-sky-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                        <p className="text-xl font-bold text-sky-700 dark:text-sky-100">
                          {entry.emotion}
                        </p>
                      </div>
                      <p className="text-5xl">{EMOTION_ILLUSTRATIONS[entry.emotion]}</p>
                    </div>
                    <div className="space-y-3">
                      {entry.prompts.map((prompt, promptIndex) => (
                        <p
                          key={promptIndex}
                          className="text-lg text-sky-800 dark:text-sky-300"
                        >
                          {prompt}
                        </p>
                      ))}
                    </div>
                    {entry.answer && (
                      <div className="mt-4">
                        <p className="text-base font-medium text-sky-700 dark:text-sky-300">Your Response:</p>
                        <p className="mt-2 text-lg text-sky-600 dark:text-sky-400">{entry.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="inline-flex items-center px-6 py-3 border border-sky-200 shadow-sm text-base font-medium rounded-xl text-sky-700 bg-white hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 dark:bg-gray-700 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                >
                  Close
                </button>
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
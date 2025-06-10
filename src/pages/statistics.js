import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AdSense from '../components/AdSense';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 감정별 일러스트 정의 (index.js와 동일하게)
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

// 긍정/부정 감정 분류
const POSITIVE_EMOTIONS = ['Happy', 'Calm', 'Love', 'Grateful'];
const NEGATIVE_EMOTIONS = ['Sad', 'Angry', 'Anxious', 'Lonely', 'Frustrated', 'Tired'];

function getJournalHistory() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('journalHistory') || '[]');
  } catch {
    return [];
  }
}

export default function Statistics() {
  const [journalHistory, setJournalHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [emotionFrequency, setEmotionFrequency] = useState({});
  const [weeklyTrend, setWeeklyTrend] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState({});
  const [dayTrend, setDayTrend] = useState({});

  useEffect(() => {
    const history = getJournalHistory();
    setJournalHistory(history);

    // 감정 빈도 계산
    const frequency = {};
    history.forEach(entry => {
      frequency[entry.emotion] = (frequency[entry.emotion] || 0) + 1;
    });
    setEmotionFrequency(frequency);

    // 일/주/월 트렌드 계산
    const daily = {};
    const weekly = {};
    const monthly = {};
    history.forEach(entry => {
      const date = new Date(entry.date);
      const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!daily[dayKey]) daily[dayKey] = {};
      if (!weekly[weekKey]) weekly[weekKey] = {};
      if (!monthly[monthKey]) monthly[monthKey] = {};
      daily[dayKey][entry.emotion] = (daily[dayKey][entry.emotion] || 0) + 1;
      weekly[weekKey][entry.emotion] = (weekly[weekKey][entry.emotion] || 0) + 1;
      monthly[monthKey][entry.emotion] = (monthly[monthKey][entry.emotion] || 0) + 1;
    });
    setDayTrend(daily);
    setWeeklyTrend(weekly);
    setMonthlyTrend(monthly);
  }, []);

  // 긍정/부정 감정 비율 계산
  const positiveCount = Object.entries(emotionFrequency).filter(([e]) => POSITIVE_EMOTIONS.includes(e)).reduce((sum, [, v]) => sum + v, 0);
  const negativeCount = Object.entries(emotionFrequency).filter(([e]) => NEGATIVE_EMOTIONS.includes(e)).reduce((sum, [, v]) => sum + v, 0);
  const pieData = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        data: [positiveCount, negativeCount],
        backgroundColor: ['#38bdf8', '#f87171'],
        borderColor: ['#0ea5e9', '#ef4444'],
        borderWidth: 2,
      },
    ],
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      Happy: 'rgba(255, 206, 86, 0.5)',
      Sad: 'rgba(54, 162, 235, 0.5)',
      Angry: 'rgba(255, 99, 132, 0.5)',
      Calm: 'rgba(75, 192, 192, 0.5)',
      Anxious: 'rgba(153, 102, 255, 0.5)',
      Love: 'rgba(255, 159, 64, 0.5)',
      Lonely: 'rgba(201, 203, 207, 0.5)',
      Frustrated: 'rgba(255, 99, 132, 0.5)',
      Grateful: 'rgba(75, 192, 192, 0.5)',
      Tired: 'rgba(153, 102, 255, 0.5)',
    };
    return colors[emotion] || 'rgba(201, 203, 207, 0.5)';
  };

  const getEmotionBorderColor = (emotion) => {
    return getEmotionColor(emotion).replace('0.5', '1');
  };

  const frequencyData = {
    labels: Object.keys(emotionFrequency),
    datasets: [
      {
        label: 'Emotion Frequency',
        data: Object.values(emotionFrequency),
        backgroundColor: Object.keys(emotionFrequency).map(getEmotionColor),
        borderColor: Object.keys(emotionFrequency).map(getEmotionBorderColor),
        borderWidth: 1,
      },
    ],
  };

  const trendData = {
    labels: Object.keys(timeRange === 'day' ? dayTrend : timeRange === 'week' ? weeklyTrend : monthlyTrend),
    datasets: Object.keys(emotionFrequency).map(emotion => ({
      label: emotion,
      data: Object.keys(timeRange === 'day' ? dayTrend : timeRange === 'week' ? weeklyTrend : monthlyTrend).map(
        key => (timeRange === 'day' ? dayTrend[key][emotion] : timeRange === 'week' ? weeklyTrend[key][emotion] : monthlyTrend[key][emotion]) || 0
      ),
      borderColor: getEmotionBorderColor(emotion),
      backgroundColor: getEmotionColor(emotion),
      tension: 0.4,
    })),
  };

  const getTopEmotions = () => {
    return Object.entries(emotionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Head>
        <title>Emotion Statistics - InnerPrompt</title>
        <meta name="description" content="View your emotional patterns and insights" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdSense />
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            ← Back to Home
          </Link>
          <div className="flex space-x-4">
            <button onClick={() => setTimeRange('day')} className={`px-3 sm:px-4 py-2 rounded-xl ${timeRange === 'day' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'}`}>Day</button>
            <button onClick={() => setTimeRange('week')} className={`px-3 sm:px-4 py-2 rounded-xl ${timeRange === 'week' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'}`}>Week</button>
            <button onClick={() => setTimeRange('month')} className={`px-3 sm:px-4 py-2 rounded-xl ${timeRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'}`}>Month</button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-indigo-100 dark:border-indigo-900 mb-6 sm:mb-8"
        >
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Your Top Emotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getTopEmotions().map(([emotion, count], index) => (
              <div
                key={emotion}
                className="bg-indigo-50 dark:bg-indigo-900/50 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800"
              >
                <div className="text-center">
                  <p className="text-6xl mb-4">{EMOTION_ILLUSTRATIONS[emotion] || '🙂'}</p>
                  <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{emotion}</p>
                  <p className="text-lg text-indigo-600 dark:text-indigo-400 mt-2">{count} times</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-indigo-100 dark:border-indigo-900 mb-6 sm:mb-8"
        >
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Emotion Frequency</h2>
          <div className="h-56 sm:h-80 w-full overflow-x-auto">
            <Bar
              data={frequencyData}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-indigo-100 dark:border-indigo-900"
        >
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">
            {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Daily'} Emotion Trends
          </h2>
          <div className="h-56 sm:h-80 w-full overflow-x-auto">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-indigo-100 dark:border-indigo-900 mt-10 mb-6 sm:mb-8"
        >
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Positive/Negative Emotion Ratio</h2>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </motion.div>

        <div className="mt-12">
          <AdSense />
        </div>
      </main>
    </div>
  );
} 
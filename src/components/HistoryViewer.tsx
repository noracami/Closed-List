import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { pastDailyLists } from '../store/tasks';
import type { Task, DailyList } from '../store/tasks';

const HistoryViewer: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // This runs only on the client, after the component has mounted.
    setHasMounted(true);
  }, []);

  const lists = useStore(pastDailyLists);
  
  // Defensive check: Ensure the value from the store is an array.
  const displayLists = Array.isArray(lists) ? lists : [];

  // On the server, and on the initial client render, render a placeholder.
  if (!hasMounted) {
    return <p className="text-center text-gray-500 py-8">載入歷史紀錄中...</p>;
  }

  return (
    <div className="space-y-8">
      {displayLists.length === 0 && (
        <p className="text-center text-gray-500 py-8">目前沒有歷史紀錄。</p>
      )}

      {displayLists.map((dailyList) => (
        <div key={dailyList.date} className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{dailyList.date}</h3>
          
          <h4 className="text-lg font-semibold text-gray-700 mb-2">當日任務:</h4>
          <ul className="space-y-2 mb-4">
            {dailyList.tasks.length === 0 && <li className="text-gray-500 text-sm italic">無任務</li>}
            {dailyList.tasks.map((task: Task) => (
              <li key={task.id} className={`flex items-center text-sm ${task.isUrgent ? 'text-red-600' : 'text-gray-700'}`}>
                {task.completed ? (
                  <span className="line-through text-gray-400 mr-2">✅</span>
                ) : (
                  <span className="text-gray-400 mr-2">❌</span>
                )}
                {task.isUrgent && <span className="font-bold mr-1">[緊急]</span>}
                {task.text}
              </li>
            ))}
          </ul>

          <h4 className="text-lg font-semibold text-gray-700 mb-2">當日收件匣:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {dailyList.tomorrowInbox.length === 0 && <li className="text-gray-500 italic">收件匣是空的</li>}
            {dailyList.tomorrowInbox.map((task: Task) => (
              <li key={task.id} className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                {task.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default HistoryViewer;

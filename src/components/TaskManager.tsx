import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { 
  currentDayTasks, 
  tomorrowInbox,
  pastDailyLists,
  currentDate,
  addTask, 
  toggleTask,
  addTaskToInbox,
  addUrgentTask,
  endOfDay,
  revertToPreviousDay, // Import the new action
} from '../store/tasks';

const TaskManager: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // This runs only on the client, after the component has mounted.
    setHasMounted(true);
  }, []);

  const tasksFromStore = useStore(currentDayTasks);
  const inboxTasksFromStore = useStore(tomorrowInbox);
  const pastListsFromStore = useStore(pastDailyLists); // Get past lists for the button logic
  const todayDate = useStore(currentDate);

  // We still keep these defensive checks
  const displayTasks = Array.isArray(tasksFromStore) ? tasksFromStore : [];
  const displayInboxTasks = Array.isArray(inboxTasksFromStore) ? inboxTasksFromStore : [];
  const displayPastLists = Array.isArray(pastListsFromStore) ? pastListsFromStore : [];

  const [todayTaskText, setTodayTaskText] = useState('');
  const [inboxTaskText, setInboxTaskText] = useState('');

  const handleTodaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(todayTaskText);
    setTodayTaskText('');
  };
  
  const handleInboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTaskToInbox(inboxTaskText);
    setInboxTaskText('');
  };
  
  const handleUrgentSubmit = () => {
    const text = prompt('請輸入緊急任務內容：');
    if (text) {
      addUrgentTask(text);
    }
  };

  const handleEndOfDay = () => {
    if (confirm('確定要結束今天並將任務滾動到明天嗎？')) {
      endOfDay();
      alert('今天已結束，任務已滾動至下一天！');
    }
  };

  const handleRevert = () => {
    if (confirm('確定要撤銷上一次的「結束今天」操作，並回到前一天的狀態嗎？')) {
      revertToPreviousDay();
      alert('已成功回到前一天！');
    }
  };

  // On the server, and on the initial client render, render nothing to avoid mismatch.
  if (!hasMounted) {
    return null; 
  }

  return (
    <>
      {/* Today's Closed List Section */}
      <div className="p-6 border rounded-lg shadow-sm bg-white mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">今日清單</h2>
          <span className="text-lg font-medium text-gray-600">{todayDate}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handleUrgentSubmit}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
          >
            緊急插入
          </button>
          <div className="flex gap-2">
            {displayPastLists.length > 0 && (
              <button
                onClick={handleRevert}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition"
              >
                回到前一天
              </button>
            )}
            <button 
              onClick={handleEndOfDay}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
            >
              結束今天
            </button>
            <a
              href="/history"
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              查看歷史紀錄
            </a>
          </div>
        </div>
        
        <form onSubmit={handleTodaySubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={todayTaskText}
            onChange={(e) => setTodayTaskText(e.target.value)}
            placeholder="手動新增一個任務到今天的封閉清單..."
            className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            新增
          </button>
        </form>

        <ul className="space-y-3">
          {displayTasks.map((task) => (
            <li key={task.id} className={`flex items-center p-3 rounded-md transition-colors duration-300 ${task.isUrgent ? 'bg-red-50' : 'bg-gray-50'}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"
              />
              <span className={`flex-grow ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.isUrgent && <span className="font-bold text-red-600 mr-2">[緊急]</span>}
                {task.text}
              </span>
            </li>
          ))}
          {displayTasks.length === 0 && (
              <p className="text-center text-gray-500 py-4">今天的清單是空的！</p>
          )}
        </ul>
      </div>

      {/* Tomorrow's Inbox Section */}
      <div className="p-6 border rounded-lg bg-gray-50/50 opacity-80">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">明天待辦 (收件匣)</h2>
        <form onSubmit={handleInboxSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={inboxTaskText}
            onChange={(e) => setInboxTaskText(e.target.value)}
            placeholder="任何新出現的想法或任務..."
            className="flex-grow px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
          >
            放入收件匣
          </button>
        </form>
        <ul className="space-y-2 text-sm">
          {displayInboxTasks.map((task) => (
            <li key={task.id} className="flex items-center text-gray-500">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              {task.text}
            </li>
          ))}
          {displayInboxTasks.length === 0 && (
            <p className="text-center text-gray-400 italic py-2">收件匣是空的。</p>
          )}
        </ul>
      </div>
    </>
  );
};

export default TaskManager;

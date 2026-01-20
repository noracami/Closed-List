import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { currentDayTasks, addTask, toggleTask } from '../store/tasks';

const TaskManager: React.FC = () => {
  const tasks = useStore(currentDayTasks);
  const [newTaskText, setNewTaskText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(newTaskText); // Use the imported action
    setNewTaskText('');
  };

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">今日清單</h2>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="新增一個任務到今天的封閉清單..."
          className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
        >
          新增
        </button>
      </form>

      {/* Task List */}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center p-3 bg-gray-50 rounded-md transition-colors duration-300">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)} // Use the imported action
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"
            />
            <span className={`flex-grow ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.text}
            </span>
          </li>
        ))}
        {tasks.length === 0 && (
            <p className="text-center text-gray-500 py-4">今天的清單是空的！</p>
        )}
      </ul>
    </div>
  );
};

export default TaskManager;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../Styles/TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="task-list-container">
        <h1>Список задач</h1>
        <div className="tasks-list">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p>Описание: {task.description || 'Нет описания'}</p>
                <p>Статус: {task.status}</p>
                <p>Срок: {task.due_date}</p>
              </div>
            ))
          ) : (
            <p>Нет задач.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
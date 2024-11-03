import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Check, Plus } from 'lucide-react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tasks`);
      setTodos(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, {
        title: newTodo,
        status: 'pending'
      });
      setTodos([...todos, response.data]);
      setNewTodo('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const updateTodo = async (id) => {
    if (!editText.trim()) return;
    
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/tasks/${id}`, {
        title: editText
      });
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/tasks/${id}/status`, {
        status: newStatus
      });
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Ma Todo List</h1>
      
      {/* Formulaire d'ajout */}
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Nouvelle tâche..."
          className="flex-1 p-2 border rounded"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={20} /> Ajouter
        </button>
      </form>

      {/* Liste des todos */}
      <div className="space-y-2">
        {todos.map(todo => (
          <div 
            key={todo.id}
            className="flex items-center gap-2 p-3 border rounded bg-white"
          >
            {editingId === todo.id ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => updateTodo(todo.id)}
                autoFocus
                className="flex-1 p-1 border rounded"
              />
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={todo.status === 'completed'}
                  onChange={() => toggleComplete(todo.id, todo.status)}
                  className="w-5 h-5"
                />
                <span className={`flex-1 ${todo.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                  {todo.title}
                </span>
                <button
                  onClick={() => {
                    setEditingId(todo.id);
                    setEditText(todo.title);
                  }}
                  className="p-1 text-blue-500 hover:text-blue-700"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;

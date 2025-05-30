import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentForm from './components/StudentForm';
import TeacherDashboard from './components/TeacherDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentForm />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;

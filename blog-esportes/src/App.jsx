import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import EditPost from './pages/EditPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/criar" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/editar/:id" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;
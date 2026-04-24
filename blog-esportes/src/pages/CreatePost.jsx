import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Futebol',
    author: '',
    image_url: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('posts')
        .insert([formData]);

      if (supabaseError) throw supabaseError;
      
      alert('Post criado com sucesso!');
      navigate('/'); 
    } catch (err) {
      setError('Erro ao salvar a notícia: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>
        <h1>Criar Nova Notícia</h1>
        <Link to="/">Voltar para a Home</Link>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>{error}</div>}
          
          <div>
            <label htmlFor="title">Título *</label>
            <br />
            <input 
              type="text" 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="author">Autor *</label>
            <br />
            <input 
              type="text" 
              id="author" 
              name="author" 
              value={formData.author} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="category">Categoria *</label>
            <br />
            <select 
              id="category" 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required
            >
              <option value="Futebol">Futebol</option>
              <option value="Basquete">Basquete</option>
              <option value="Vôlei">Vôlei</option>
              <option value="e-Sports">e-Sports</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label htmlFor="image_url">URL da Imagem de Capa (Opcional)</label>
            <br />
            <input 
              type="url" 
              id="image_url" 
              name="image_url" 
              value={formData.image_url} 
              onChange={handleChange} 
              placeholder="https://..." 
            />
          </div>

          <div>
            <label htmlFor="content">Conteúdo da Matéria *</label>
            <br />
            <textarea 
              id="content" 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              rows="8" 
              required
            />
          </div>

          <br />
          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Publicar Notícia'}
          </button>
        </form>
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
    image_url: ''
  });

  // Puxa os dados atuais do post para preencher o formulário
  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setFormData({
          title: data.title,
          content: data.content,
          category: data.category,
          author: data.author,
          image_url: data.image_url || ''
        });
      } catch (err) {
        setError('Erro ao carregar os dados para edição.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      setError('Preencha todos os campos obrigatórios.');
      setSaving(false);
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('posts')
        .update(formData)
        .eq('id', id); // Atualiza onde o ID for igual ao da URL

      if (supabaseError) throw supabaseError;
      
      alert('Post atualizado com sucesso!');
      navigate(`/post/${id}`); // Joga de volta pra tela de detalhes
    } catch (err) {
      setError('Erro ao atualizar a notícia: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Carregando dados do post...</div>;

  return (
    <div>
      <header>
        <h1>Editar Notícia</h1>
        <Link to={`/post/${id}`}>Cancelar</Link>
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
          <button type="submit" disabled={saving}>
            {saving ? 'Atualizando...' : 'Salvar Alterações'}
          </button>
        </form>
      </main>
    </div>
  );
}
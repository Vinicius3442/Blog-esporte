import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado pro formulário de novo comentário
  const [newComment, setNewComment] = useState({ author: '', message: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        // Puxa o post
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (postError) throw postError;
        setPost(postData);

        // Puxa os comentários em ordem cronológica
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', id)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;
        setComments(commentsData || []);

      } catch (err) {
        setError('Erro ao carregar os dados.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Função de Excluir Post (Delete)
  const handleDeletePost = async () => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta notícia?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      
      alert('Post excluído com sucesso!');
      navigate('/');
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  // Função de Adicionar Comentário
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.author || !newComment.message) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id: id, author: newComment.author, message: newComment.message }])
        .select()
        .single();

      if (error) throw error;

      // Atualiza a lista na tela sem precisar recarregar
      setComments([...comments, data]);
      setNewComment({ author: '', message: '' }); // Limpa o form
    } catch (err) {
      alert('Erro ao enviar comentário: ' + err.message);
    }
  };

  // Função de Excluir Comentário
  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm('Deseja apagar este comentário?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;

      // Tira da tela o comentário apagado
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert('Erro ao excluir comentário: ' + err.message);
    }
  };

  if (loading) return <div>Carregando matéria...</div>;
  if (error || !post) return <div>Matéria não encontrada.</div>;

  return (
    <div>
      <header>
        <Link to="/">Voltar para a Home</Link>
        <nav>
          <Link to={`/editar/${post.id}`} style={{ marginRight: '10px' }}>Editar Post</Link>
          <button onClick={handleDeletePost}>Excluir Post</button>
        </nav>
      </header>

      <main>
        <article>
          <span>{post.category}</span>
          <h1>{post.title}</h1>
          <p>Por {post.author} • {new Date(post.created_at).toLocaleDateString('pt-BR')}</p>
          
          {post.image_url && <img src={post.image_url} alt="Capa" style={{ maxWidth: '100%' }} />}
          
          <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </div>
        </article>

        <hr style={{ margin: '40px 0' }} />

        <section>
          <h2>Comentários ({comments.length})</h2>
          
          <form onSubmit={handleAddComment} style={{ marginBottom: '20px' }}>
            <div>
              <label>Nome:</label>
              <br />
              <input 
                type="text" 
                value={newComment.author} 
                onChange={(e) => setNewComment({...newComment, author: e.target.value})}
                required
              />
            </div>
            <div>
              <label>Mensagem:</label>
              <br />
              <textarea 
                value={newComment.message} 
                onChange={(e) => setNewComment({...newComment, message: e.target.value})}
                required
              />
            </div>
            <button type="submit">Comentar</button>
          </form>

          <div>
            {comments.length === 0 ? (
              <p>Seja o primeiro a comentar!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} style={{ border: '1px solid gray', padding: '10px', marginBottom: '10px' }}>
                  <strong>{comment.author}</strong> - <span>{new Date(comment.created_at).toLocaleDateString('pt-BR')}</span>
                  <p>{comment.message}</p>
                  <button onClick={() => handleDeleteComment(comment.id)}>Excluir Comentário</button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
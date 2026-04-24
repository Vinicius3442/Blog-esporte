import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(5); // 1 Destaque + 4 Cards iniciais

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        setError('Erro ao carregar as notícias.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (error) return <div className="container" style={{ marginTop: '100px' }}>{error}</div>;

  // Lógica de Filtro
  const filteredPosts = posts.filter(post => {
    const matchCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
    const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featuredPost = filteredPosts[0];
  const restPosts = filteredPosts.slice(1, visibleCount);
  const hasMorePosts = visibleCount < filteredPosts.length;

  return (
    <>
      {/* Header Fixo com Glassmorphism */}
      <header className="glass-header">
        <div className="header-container">
          <h1>Blog de Esportes</h1>
          <div className="header-actions">
            <input 
              type="text" 
              placeholder="Buscar matéria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
            <Link to="/criar" className="btn">Novo Post</Link>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="categories-bar">
          {['Todas', 'Futebol', 'Basquete', 'Vôlei', 'e-Sports', 'Outros'].map(cat => (
            <button 
              key={cat} 
              className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skeleton Loading (Enquanto busca no Supabase) */}
        {loading ? (
          <>
            <div className="hero skeleton-box" style={{ height: '350px' }}></div>
            <div className="grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="card">
                  <div className="skeleton-box" style={{ height: '200px' }}></div>
                  <div style={{ padding: '20px' }}>
                    <div className="skeleton-box" style={{ height: '15px', width: '30%', marginBottom: '10px' }}></div>
                    <div className="skeleton-box" style={{ height: '25px', width: '90%', marginBottom: '15px' }}></div>
                    <div className="skeleton-box" style={{ height: '15px', width: '50%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filteredPosts.length === 0 ? (
          <p>Nenhuma notícia encontrada com esses filtros.</p>
        ) : (
          <>
            {/* Destaque */}
            {featuredPost && (
              <section className="hero fade-in">
                {featuredPost.image_url ? (
                  <img src={featuredPost.image_url} alt="Capa destaque" className="hero-img" />
                ) : (
                  <div className="hero-img placeholder">Sem Imagem</div>
                )}
                <div className="hero-content">
                  <span className="badge">{featuredPost.category}</span>
                  <h2>{featuredPost.title}</h2>
                  <p className="hero-meta">Por {featuredPost.author} • {new Date(featuredPost.created_at).toLocaleDateString('pt-BR')}</p>
                  <p className="hero-excerpt">
                    {featuredPost.content.substring(0, 150)}...
                  </p>
                  <Link to={`/post/${featuredPost.id}`} className="btn">Ler matéria completa</Link>
                </div>
              </section>
            )}

            {/* Grid */}
            <div className="grid">
              {restPosts.map((post, index) => (
                <article 
                  key={post.id} 
                  className="card fade-in" 
                  style={{ animationDelay: `${index * 0.1}s` }} /* Efeito cascata na animação */
                >
                  {post.image_url ? (
                    <img src={post.image_url} alt={`Capa: ${post.title}`} />
                  ) : (
                    <div style={{height: '200px', backgroundColor: '#333'}}></div>
                  )}
                  
                  <div>
                    <span>{post.category}</span>
                    <h2>{post.title}</h2>
                    <p>Por {post.author}</p>
                    <Link to={`/post/${post.id}`}>Ler matéria</Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Botão de Carregar Mais */}
            {hasMorePosts && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button 
                  className="btn" 
                  style={{ padding: '15px 40px', backgroundColor: 'transparent', border: '2px solid var(--green-flat)', color: 'var(--text-light)' }}
                  onClick={() => setVisibleCount(prev => prev + 4)}
                >
                  Carregar Mais Notícias
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
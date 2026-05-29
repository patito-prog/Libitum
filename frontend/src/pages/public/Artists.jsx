import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI.js';
import useAuthContext from '../../hooks/useAuthContext.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingDots from '../../components/common/LoadingDots.jsx';
import API_BASE from '../../config/api.js';
import styles from './Artists.module.scss';

const API_URL = `${API_BASE}/api/artists`;

/**
 * Explorar artistas: buscador con resultados en rejilla. Desde aquí se puede
 * seguir/dejar de seguir y entrar al perfil de cada artista. Acceso libre;
 * para seguir hace falta sesión (si no, mandamos al login).
 */
const Artists = () => {
    const { getData, save, deleteData } = useAPI();
    const { isAuthenticated, user } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();

    const [query, setQuery]           = useState('');
    const [debounced, setDebounced]   = useState('');
    const [artists, setArtists]       = useState([]);
    const [page, setPage]             = useState(1);
    const [hasMore, setHasMore]       = useState(false);
    const [loading, setLoading]       = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [followingId, setFollowingId] = useState(null); // id en proceso de follow

    // Debounce del buscador para no llamar en cada tecla.
    useEffect(() => {
        const t = setTimeout(() => setDebounced(query), 350);
        return () => clearTimeout(t);
    }, [query]);

    const fetchArtists = useCallback(async (pageNum, q, isReset) => {
        if (isReset) setLoading(true); else setLoadingMore(true);
        try {
            const params = new URLSearchParams({ page: pageNum });
            if (q) params.set('q', q);
            const res = await getData(`${API_URL}?${params}`);
            const paginator = res?.data;
            const list = paginator?.data ?? [];
            setArtists(prev => isReset ? list : [...prev, ...list]);
            setHasMore((paginator?.current_page ?? 1) < (paginator?.last_page ?? 1));
        } catch {
            showMessageWithTime('No se han podido cargar los artistas.', 'error');
        } finally {
            if (isReset) setLoading(false); else setLoadingMore(false);
        }
    }, [getData, showMessageWithTime]);

    useEffect(() => {
        setPage(1);
        fetchArtists(1, debounced, true);
    }, [debounced]);

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchArtists(next, debounced, false);
    };

    const toggleFollow = async (artist, e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/artistas' } });
            return;
        }
        setFollowingId(artist.id);
        const wasFollowing = artist.is_following;
        // Optimista: cambiamos ya en pantalla y revertimos si falla.
        setArtists(prev => prev.map(a => a.id === artist.id
            ? { ...a, is_following: !wasFollowing, followers_count: a.followers_count + (wasFollowing ? -1 : 1) }
            : a));
        try {
            if (wasFollowing) await deleteData(`${API_BASE}/api/artist/${artist.id}/unfollow`);
            else              await save(`${API_BASE}/api/artist/${artist.id}/follow`, {});
        } catch {
            showMessageWithTime('No se pudo completar la acción.', 'error');
            setArtists(prev => prev.map(a => a.id === artist.id
                ? { ...a, is_following: wasFollowing, followers_count: a.followers_count + (wasFollowing ? 1 : -1) }
                : a));
        } finally {
            setFollowingId(null);
        }
    };

    return (
        <div className={styles.page}>
            <h1>Descubre artistas</h1>
            <p className={styles.subtitle}>Busca artistas, síguelos y no te pierdas sus directos.</p>

            <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Busca por nombre..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                />
                {query && <button className={styles.clearBtn} onClick={() => setQuery('')}>✕</button>}
            </div>

            {loading ? (
                <div className={styles.center}><LoadingDots /></div>
            ) : artists.length === 0 ? (
                <EmptyState icon="🎸" message="No se han encontrado artistas con ese nombre." />
            ) : (
                <>
                    <div className={styles.grid}>
                        {artists.map(artist => {
                            const isMe = user?.id === artist.id;
                            return (
                                <div
                                    key={artist.id}
                                    className={styles.card}
                                    onClick={() => navigate(`/user/${artist.id}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && navigate(`/user/${artist.id}`)}
                                >
                                    <div className={styles.avatar}>
                                        {artist.avatar_url
                                            ? <img src={artist.avatar_url} alt={artist.name} />
                                            : <span>{artist.name?.charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <p className={styles.name}>{artist.name}</p>
                                    <p className={styles.followers}>
                                        {artist.followers_count} seguidor{artist.followers_count !== 1 ? 'es' : ''}
                                    </p>
                                    {!isMe && (
                                        <button
                                            className={`${styles.followBtn} ${artist.is_following ? styles.following : ''}`}
                                            onClick={e => toggleFollow(artist, e)}
                                            disabled={followingId === artist.id}
                                        >
                                            {artist.is_following ? '✓ Siguiendo' : '+ Seguir'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <div className={styles.center}>
                            <button className={styles.moreBtn} onClick={loadMore} disabled={loadingMore}>
                                {loadingMore ? 'Cargando...' : 'Ver más artistas'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Artists;

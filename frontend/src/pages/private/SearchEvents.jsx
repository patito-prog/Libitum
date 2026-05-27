import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI.js';
import useEventContext from '../../hooks/useEventContext.js';
import MiniEvent from '../../components/MiniEvent.jsx';
import MiniEventSkeleton from '../../components/common/MiniEvenSkeleton.jsx';
import styles from './SearchEvents.module.scss';
import API_BASE from '../../config/api.js';

const STATUS_FILTERS = [
    { value: 'published', label: 'Publicado' },
    { value: 'live',      label: 'En directo' },
    { value: 'finished',  label: 'Terminado' },
    { value: 'cancelled', label: 'Cancelado' },
];

const API_URL = `${API_BASE}/api/events/search`;

const SearchEvents = () => {
    const { getData } = useAPI();
    const { categories, toggleLike } = useEventContext();
    const navigate = useNavigate();

    const [query, setQuery]             = useState('');
    const [debouncedQuery, setDebounced] = useState('');
    const [categoryFilter, setCategory] = useState(null);
    const [statusFilter, setStatus]     = useState(null);
    const [results, setResults]         = useState([]);
    const [page, setPage]               = useState(1);
    const [hasMore, setHasMore]         = useState(false);
    const [loading, setLoading]         = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searched, setSearched]       = useState(false);

    const sentinelRef = useRef(null);
    const isFetching  = useRef(false);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(query), 350);
        return () => clearTimeout(t);
    }, [query]);

    const fetchResults = useCallback(async (pageNum, q, catId, status, isReset) => {
        if (isFetching.current) return;
        isFetching.current = true;
        if (isReset) setLoading(true); else setLoadingMore(true);

        try {
            const params = new URLSearchParams({ page: pageNum });
            if (q)      params.set('q', q);
            if (catId)  params.set('category_id', catId);
            if (status) params.set('status', status);

            const res       = await getData(`${API_URL}?${params}`);
            const paginator = res?.data;
            const newEvents = paginator?.data ?? [];

            setResults(prev => isReset ? newEvents : [...prev, ...newEvents]);
            setHasMore((paginator?.current_page ?? 1) < (paginator?.last_page ?? 1));
            setSearched(true);
        } catch {
            // silencioso
        } finally {
            isFetching.current = false;
            if (isReset) setLoading(false); else setLoadingMore(false);
        }
    }, [getData]);

    useEffect(() => {
        if (!debouncedQuery && !categoryFilter && !statusFilter) {
            setResults([]);
            setSearched(false);
            return;
        }
        setPage(1);
        fetchResults(1, debouncedQuery, categoryFilter, statusFilter, true);
    }, [debouncedQuery, categoryFilter, statusFilter]);

    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isFetching.current) {
                setPage(prev => {
                    const next = prev + 1;
                    fetchResults(next, debouncedQuery, categoryFilter, statusFilter, false);
                    return next;
                });
            }
        }, { rootMargin: '200px', threshold: 0 });
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, debouncedQuery, categoryFilter, statusFilter, results.length, fetchResults]);

    const handleLike = async (id) => {
        setResults(prev => prev.map(e => e.id === id ? { ...e, liked: !e.liked } : e));
        const backendLiked = await toggleLike(id);
        if (backendLiked !== undefined) {
            setResults(prev => prev.map(e => e.id === id ? { ...e, liked: backendLiked } : e));
        }
    };

    const toggleStatus = (value) => setStatus(prev => prev === value ? null : value);
    const toggleCategory = (id) => setCategory(prev => prev === id ? null : id);

    return (
        <div className={styles.page}>
            <h1>Buscar eventos</h1>

            <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Título, artista, lugar..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                />
                {query && (
                    <button className={styles.clearBtn} onClick={() => setQuery('')}>✕</button>
                )}
            </div>

            <div className={styles.filterBar}>
                {STATUS_FILTERS.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        className={`${styles.chip} ${statusFilter === value ? styles.chipActive : ''} ${styles[`chip_${value}`]}`}
                        onClick={() => toggleStatus(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {categories.length > 0 && (
                <div className={styles.filterBar}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`${styles.chip} ${categoryFilter === cat.id ? styles.chipActive : ''}`}
                            onClick={() => toggleCategory(cat.id)}
                        >
                            {cat.icon && <span>{cat.icon}</span>} {cat.name}
                        </button>
                    ))}
                </div>
            )}

            <div className={styles.results}>
                {loading ? (
                    [1, 2, 3].map(n => <MiniEventSkeleton key={n} />)
                ) : !searched ? (
                    <div className={styles.hint}>
                        <p>Escribe algo o selecciona un filtro para buscar eventos</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No se encontraron eventos con esos criterios.</p>
                    </div>
                ) : (
                    <>
                        <p className={styles.count}>{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
                        {results.map(event => (
                            <MiniEvent
                                key={event.id}
                                data={event}
                                onClick={() => navigate(`/event/${event.id}`)}
                                onLike={handleLike}
                            />
                        ))}
                        <div ref={sentinelRef} className={styles.loadMore}>
                            {loadingMore && (
                                <>
                                    <span className={styles.dot} />
                                    <span className={styles.dot} />
                                    <span className={styles.dot} />
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchEvents;

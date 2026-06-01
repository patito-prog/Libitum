import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAPI from "../../hooks/useAPI.js";
import useEventContext from "../../hooks/useEventContext.js";
import useAuthContext from "../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import Event from "../../components/Event.jsx";
import styles from "./Feed.module.scss";
import EventSkeleton from "../../components/common/EventSkeleton.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingDots from "../../components/common/LoadingDots.jsx";
import API_BASE from "../../config/api.js";

// Chips de filtro por estado que se muestran sobre el feed.
const STATUS_FILTERS = [
    { value: null,          label: 'Todos' },
    { value: 'live',        label: 'En directo' },
    { value: 'published',   label: 'Publicado' },
    { value: 'finished',    label: 'Terminado' },
    { value: 'cancelled',   label: 'Cancelado' },
];

/**
 * Feed "Para Ti" — la pantalla principal estilo TikTok/Instagram.
 *
 * Tiene dos modos ("Siguiendo" / "Descubrir") y filtro por estado. Pagina con
 * scroll infinito vía IntersectionObserver (un centinela al final dispara la
 * siguiente página). Como el modo descubrir pide eventos en orden aleatorio,
 * deduplicamos por id al fusionar páginas para no repetir tarjetas.
 */
const Feed = () => {
    const { getData, save, deleteData } = useAPI();
    const { toggleLike } = useEventContext();
    const { user } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();
    const API = `${API_BASE}/api`;
    const [feedEvents, setFeedEvents] = useState([]);
    const [mode, setMode] = useState("discover");
    const [statusFilter, setStatusFilter] = useState(null);
    const [locating, setLocating] = useState(false);   // pidiendo la ubicación al navegador
    const coordsRef = useRef(null);                     // {lat, lng} del usuario para "Cerca de mí"
    const [, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const feedContainerRef = useRef(null);
    const sentinelRef = useRef(null);
    const isFetching = useRef(false);

    const fetchEvents = useCallback(async (pageNum, currentMode, currentStatus, isReset) => {
        if (isFetching.current) return;
        isFetching.current = true;

        if (isReset) setInitialLoading(true);
        else setLoadingMore(true);

        try {
            const statusParam = currentStatus ? `&status=${currentStatus}` : '';
            // En "Cerca de mí" mandamos la ubicación del usuario para que el backend
            // calcule distancias y filtre por radio.
            const nearParam = currentMode === 'near' && coordsRef.current
                ? `&lat=${coordsRef.current.lat}&lng=${coordsRef.current.lng}`
                : '';
            const response = await getData(
                `${API_BASE}/api/feed?mode=${currentMode}&page=${pageNum}${statusParam}${nearParam}`
            );
            const paginator = response?.data;
            const newEvents = paginator?.data ?? [];

            // El feed usa orden aleatorio paginado → un evento puede repetirse
            // entre páginas. Deduplicamos por id para evitar keys duplicadas en React.
            setFeedEvents(prev => {
                const merged = isReset ? newEvents : [...prev, ...newEvents];
                const seen = new Set();
                return merged.filter(e => {
                    if (seen.has(e.id)) return false;
                    seen.add(e.id);
                    return true;
                });
            });
            setHasMore((paginator?.current_page ?? 1) < (paginator?.last_page ?? 1));
            setFetchError(false);
        } catch {
            setFetchError(true);
        } finally {
            isFetching.current = false;
            if (isReset) setInitialLoading(false);
            else setLoadingMore(false);
        }
    }, [getData]);

    // Reset y fetch cuando cambia el modo o el filtro de estado
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setFeedEvents([]);
        fetchEvents(1, mode, statusFilter, true);
        feedContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [mode, statusFilter]);

    // IntersectionObserver para cargar más al llegar al final
    useEffect(() => {
        if (!sentinelRef.current || !feedContainerRef.current || !hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetching.current) {
                    setPage(prev => {
                        const next = prev + 1;
                        fetchEvents(next, mode, statusFilter, false);
                        return next;
                    });
                }
            },
            { root: feedContainerRef.current, rootMargin: "200px", threshold: 0 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, mode, statusFilter, feedEvents.length, fetchEvents]);

    // "Cerca de mí": pide la ubicación al navegador y, si hay permiso, cambia al modo near.
    const handleNearMode = () => {
        if (mode === 'near') return;
        if (!('geolocation' in navigator)) {
            showMessageWithTime('Tu navegador no permite usar la ubicación.', 'error');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                coordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setLocating(false);
                setMode('near');
            },
            () => {
                setLocating(false);
                showMessageWithTime('Necesito tu permiso de ubicación para enseñarte eventos cerca de ti.', 'error');
            },
            { enableHighAccuracy: false, timeout: 10000 }
        );
    };

    const handleInscribe = async (id, isSignedUp) => {
        if (!user) {
            showMessageWithTime('Para poder apuntarte debes registrarte primero', 'error');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        setFeedEvents(prev => prev.map(evt =>
            evt.id === id ? { ...evt, signed_up: !isSignedUp } : evt
        ));
        try {
            if (isSignedUp) {
                await deleteData(`${API}/user/${id}`);
            } else {
                await save(`${API}/user/event`, { event_id: id });
            }
        } catch {
            setFeedEvents(prev => prev.map(evt =>
                evt.id === id ? { ...evt, signed_up: isSignedUp } : evt
            ));
        }
    };

    const handleFeedLike = async (id) => {
        setFeedEvents(prev => prev.map(evt =>
            evt.id === id ? { ...evt, liked: !evt.liked } : evt
        ));
        const backendLikedStatus = await toggleLike(id);
        if (backendLikedStatus !== undefined) {
            setFeedEvents(prev => prev.map(evt =>
                evt.id === id ? { ...evt, liked: backendLikedStatus } : evt
            ));
        }
    };

    return (
        <div className={styles.feedWrapper}>
            <div className={styles.feedHeader}>
                <div className={styles.topNav}>
                    <button
                        type="button"
                        className={`${styles.navBtn} ${mode === 'following' ? styles.active : ''}`}
                        onClick={() => setMode('following')}
                    >
                        Siguiendo
                    </button>
                    <span className={styles.separator}>|</span>
                    <button
                        type="button"
                        className={`${styles.navBtn} ${mode === 'discover' ? styles.active : ''}`}
                        onClick={() => setMode('discover')}
                    >
                        Para Ti
                    </button>
                    <span className={styles.separator}>|</span>
                    <button
                        type="button"
                        className={`${styles.navBtn} ${mode === 'near' ? styles.active : ''}`}
                        onClick={handleNearMode}
                        disabled={locating}
                    >
                        {locating ? 'Localizando…' : '📍 Cerca'}
                    </button>
                </div>

                <div className={styles.filterBar}>
                    {STATUS_FILTERS.map(({ value, label }) => (
                        <button
                            key={label}
                            type="button"
                            className={`${styles.filterChip} ${statusFilter === value ? styles.filterChipActive : ''} ${value ? styles[`chip_${value}`] : ''}`}
                            onClick={() => setStatusFilter(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.feedContainer} ref={feedContainerRef}>
                {initialLoading ? (
                    [1, 2].map(n => (
                        <div key={n} className={styles.snapItem}>
                            <EventSkeleton />
                        </div>
                    ))
                ) : fetchError ? (
                    <EmptyState icon="⚠️" message="Hubo un error al cargar el feed." />
                ) : feedEvents.length === 0 ? (
                    <EmptyState
                        icon="🎵"
                        message={
                            statusFilter
                                ? `No hay eventos con estado "${STATUS_FILTERS.find(s => s.value === statusFilter)?.label}" por ahora.`
                                : mode === 'following'
                                    ? "No sigues a nadie aún."
                                    : mode === 'near'
                                        ? "No hay eventos cerca de ti ahora mismo."
                                        : "No hay eventos nuevos por ahora."
                        }
                        hint={
                            mode === 'following'
                                ? "Descubre nuevos artistas en 'Para Ti'."
                                : mode === 'near'
                                    ? "Prueba 'Para Ti' para ver eventos de cualquier zona."
                                    : undefined
                        }
                    />
                ) : (
                    <>
                        {feedEvents.map(event => (
                            <div key={event.id} className={styles.snapItem}>
                                <Event data={event} onLike={handleFeedLike} onInscribe={handleInscribe} compact />
                            </div>
                        ))}

                        <div ref={sentinelRef} className={styles.loadingMoreContainer}>
                            {loadingMore && <LoadingDots />}
                            {!loadingMore && !hasMore && (
                                <p className={styles.endMessage}>
                                    Ya has visto todos los eventos publicados ✦
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Feed;

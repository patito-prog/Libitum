import { useState, useEffect, useRef, useCallback } from "react";
import useAPI from "../../hooks/useAPI.js";
import useEventContext from "../../hooks/useEventContext.js";
import Event from "../../components/Event.jsx";
import styles from "./Feed.module.scss";
import EventSkeleton from "../../components/common/EventSkeleton.jsx";

const STATUS_FILTERS = [
    { value: null,          label: 'Todos' },
    { value: 'live',        label: 'En directo' },
    { value: 'published',   label: 'Publicado' },
    { value: 'finished',    label: 'Terminado' },
    { value: 'cancelled',   label: 'Cancelado' },
];

const Feed = () => {
    const { getData } = useAPI();
    const { toggleLike } = useEventContext();
    const [feedEvents, setFeedEvents] = useState([]);
    const [mode, setMode] = useState("discover");
    const [statusFilter, setStatusFilter] = useState(null);
    const [page, setPage] = useState(1);
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
            const response = await getData(
                `http://localhost:8000/api/feed?mode=${currentMode}&page=${pageNum}${statusParam}`
            );
            const paginator = response?.data;
            const newEvents = paginator?.data ?? [];

            setFeedEvents(prev => isReset ? newEvents : [...prev, ...newEvents]);
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

            <div className={styles.feedContainer} ref={feedContainerRef}>
                {initialLoading ? (
                    [1, 2].map(n => (
                        <div key={n} className={styles.snapItem}>
                            <EventSkeleton />
                        </div>
                    ))
                ) : fetchError ? (
                    <div className={styles.messageBox}>
                        <p>Hubo un error al cargar el feed.</p>
                    </div>
                ) : feedEvents.length === 0 ? (
                    <div className={styles.messageBox}>
                        <p>
                            {statusFilter
                                ? `No hay eventos con estado "${STATUS_FILTERS.find(s => s.value === statusFilter)?.label}" por ahora.`
                                : mode === 'following'
                                    ? "No sigues a nadie o no han publicado eventos aún. ¡Descubre nuevos artistas en 'Para Ti'!"
                                    : "No hay eventos nuevos por ahora."
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {feedEvents.map(event => (
                            <div key={event.id} className={styles.snapItem}>
                                <Event data={event} onLike={handleFeedLike} />
                            </div>
                        ))}

                        <div ref={sentinelRef} className={styles.loadingMoreContainer}>
                            {loadingMore && (
                                <div className={styles.loadingMore}>
                                    <span className={styles.dot} />
                                    <span className={styles.dot} />
                                    <span className={styles.dot} />
                                </div>
                            )}
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

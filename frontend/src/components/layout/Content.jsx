import styles from './Content.module.scss';

const Content = ({ children }) => (
    <main className={styles.content}>{children}</main>
);

export default Content;
